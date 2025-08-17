import React, { useEffect, useRef, useState } from 'react';
// Define the desired stage order (top-level, so it's accessible in render)
const stageOrder = [
    'pii_detection',
    'anonymize_pii',
    'predict_service_codes',
    'rerank_service_codes',
    'validate_soap',
    'question_generation',
    'output',
    'patient_summary_pdf'
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const stageConfig = {
    'pii_detection': { name: 'PII Detection', icon: '🔍', description: 'Scanning for sensitive information' },
    'anonymize_pii': { name: 'PII Anonymization', icon: '🛡️', description: 'Protecting sensitive data' },
    'predict_service_codes': { name: 'Code Prediction', icon: '🎯', description: 'AI predicting service codes' },
    'rerank_service_codes': { name: 'Code Reranking', icon: '📊', description: 'Optimizing code selection' },
    'validate_soap': { name: 'SOAP Validation', icon: '✅', description: 'Validating against rules' },
    'question_generation': { name: 'Question Generation', icon: '❓', description: 'Generating clarifying questions' },
    'output': { name: 'Final Output', icon: '📄', description: 'Preparing final results' },
    'patient_summary_pdf': { name: 'PDF Summary', icon: '📥', description: 'Downloading patient summary PDF' }
};

function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

function getStageBackgroundClass(status) {
    switch (status) {
        case 'current': return 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50';
        case 'completed': return 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30';
        case 'waiting': return 'bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-500/50';
        case 'skipped': return 'bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30';
        default: return 'bg-slate-800/30 border border-slate-600/30';
    }
}
function getStatusIndicator(status) {
    switch (status) {
        case 'current': return <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />;
        case 'completed': return <div className="w-3 h-3 bg-green-500 rounded-full" />;
        case 'waiting': return <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping" />;
        default: return <div className="w-3 h-3 bg-gray-500 rounded-full opacity-30" />;
    }
}

export default function Agentic() {
    const [wsStatus, setWsStatus] = useState('Connecting...');
    const [soapNote, setSoapNote] = useState('');
    const [inputDisabled, setInputDisabled] = useState(true);
    const [aiThinking, setAiThinking] = useState(false);
    const [questionForm, setQuestionForm] = useState(false);
    const [finalDocument, setFinalDocument] = useState(false);
    const [reasoningTrail, setReasoningTrail] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [questionTerms, setQuestionTerms] = useState([]);
    const [userResponses, setUserResponses] = useState({});
    const [serviceCodes, setServiceCodes] = useState([]);
    const [currentServiceCode, setCurrentServiceCode] = useState(null);
    const [workflowStages, setWorkflowStages] = useState([]);
    const [finalReasoningTrail, setFinalReasoningTrail] = useState([]);
    const [chatMessages, setChatMessages] = useState([]); // {role: 'ai'|'user', text: string, stage?: string}
    const [questionIdx, setQuestionIdx] = useState(0);
    const [soapSent, setSoapSent] = useState(false);
    const [timeline, setTimeline] = useState([]);
    const wsRef = useRef(null);
    const sessionId = useRef(getSessionId());

    // Helper to add items to timeline, avoiding duplicates for stages
    const pushTimeline = item => {
        setTimeline(prev => {
            if (item.type === 'stage') {
                // Only add if not already present (by key)
                if (prev.some(t => t.key === item.key)) return prev;
            }
            return [...prev, item];
        });
    };

    // WebSocket connection and event handling
    useEffect(() => {
        setWsStatus('Connecting...');
        setInputDisabled(true);
        setWorkflowStages([]);
        const wsUrl = `${BACKEND_URL.replace(/^http/, 'ws')}/ws/agentic-workflow/${sessionId.current}`;
        const ws = new window.WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
            setWsStatus('🤖 AI Connected');
            setInputDisabled(false);
        };
        ws.onclose = () => {
            setWsStatus('❌ Disconnected');
            setInputDisabled(true);
        };
        ws.onerror = () => {
            setWsStatus('⚠️ Connection Error');
            setInputDisabled(true);
        };
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const payload = data.payload || {};
                if (payload.reasoning_trail) setReasoningTrail(payload.reasoning_trail);
                console.log(data);

                if (payload.stages) {
                    setWorkflowStages(payload.stages);
                    // Only push executed stages (status 'completed' or 'current')
                    payload.stages.forEach(stage => {
                        if (stage.status === 'completed' || stage.status === 'current') {
                            const config = stageConfig[stage.code];
                            if (!config) return;
                            pushTimeline({
                                type: 'stage',
                                side: 'left',
                                key: `stage-${stage.code}`,
                                icon: config.icon,
                                name: config.name,
                                description: config.description
                            });
                        }
                    });
                }
                // PDF download event
                if (data.event_type === 'pdf_ready') {
                    const { filename, pdf_base64 } = data.payload;
                    if (filename && pdf_base64) {
                        const byteCharacters = atob(pdf_base64);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: "application/pdf" });
                        const link = document.createElement("a");
                        link.href = window.URL.createObjectURL(blob);
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                    }
                }
                switch (data.event_type) {
                    case 'waiting_for_user': handleWaitingForUser(payload); break;
                    case 'workflow_finished': handleWorkflowFinished(payload); break;
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse WebSocket message:', e);
            }
        };
        return () => ws.close();
        // eslint-disable-next-line
    }, [sessionId.current]);

    function handleWaitingForUser(payload) {
        setAiThinking(false);
        setQuestionForm(true);
        setCurrentServiceCode(payload.predicted_service_codes?.[0]?.code || null);
        // Only unanswered terms
        const terms = (payload.predicted_service_codes?.[0]?.missing_terms || []).filter(t => !t.answered).map(t => t.term);
        setQuestionTerms(terms);
        setQuestionIdx(0);
        setUserResponses({});
        // Add AI question to chat and timeline
        setChatMessages(prev => [...prev, { role: 'ai', text: payload.question || 'Please provide additional information.', stage: 'question_generation' }]);
        pushTimeline({
            type: 'chat',
            side: 'left',
            key: `chat-ai-${Date.now()}`,
            icon: '🤖',
            name: stageConfig['question_generation']?.name,
            text: payload.question || 'Please provide additional information.'
        });
    }

    function handleWorkflowFinished(payload) {
        setAiThinking(false);
        setQuestionForm(false);
        setFinalDocument(true);
        setServiceCodes(payload.predicted_service_codes || []);
        setFinalReasoningTrail(payload.reasoning_trail || []);
        // Add analysis complete to timeline
        pushTimeline({
            type: 'final',
            side: 'left',
            key: `final-${Date.now()}`,
            icon: '✅',
            name: 'Analysis Complete!',
            serviceCodes: payload.predicted_service_codes || []
        });
    }

    // Submit SOAP note
    async function handleSoapSubmit(e) {
        e.preventDefault();
        if (!soapNote.trim()) return;
        setAiThinking(true);
        setQuestionForm(false);
        setFinalDocument(false);
        setReasoningTrail(['AI Agent initializing...']);
        setWorkflowStages([]);
        setChatMessages(prev => [...prev, { role: 'user', text: soapNote }]);
        setSoapNote('');
        setSoapSent(true);
        // Add user SOAP note to timeline
        pushTimeline({
            type: 'chat',
            side: 'right',
            key: `chat-user-soap-${Date.now()}`,
            icon: '🧑',
            name: '',
            text: soapNote
        });
        try {
            await fetch(`${BACKEND_URL}/api/submit_soap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soap_text: soapNote, session_id: sessionId.current })
            });
        } catch (error) {
            setReasoningTrail([`Connection Error: ${error.message}`]);
        }
    }

    // Respond to agent question (sequential)
    async function handleSend(e) {
        e.preventDefault();
        const term = questionTerms[questionIdx];
        if (!userResponses[term]?.trim()) return;
        // Show the question as an AI bubble before the answer
        setChatMessages(prev => [
            ...prev,
            { role: 'ai', text: term, stage: 'question_generation' },
            { role: 'user', text: userResponses[term] }
        ]);
        // Add question and answer to timeline
        pushTimeline({
            type: 'chat',
            side: 'left',
            key: `chat-ai-term-${Date.now()}`,
            icon: '🤖',
            name: stageConfig['question_generation']?.name,
            text: term
        });
        pushTimeline({
            type: 'chat',
            side: 'right',
            key: `chat-user-term-${Date.now()}`,
            icon: '🧑',
            name: '',
            text: userResponses[term]
        });
        if (questionIdx < questionTerms.length - 1) {
            setQuestionIdx(questionIdx + 1);
        } else {
            setQuestionForm(false);
            setAiThinking(true);
            try {
                await fetch(`${BACKEND_URL}/api/respond?session_id=${sessionId.current}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ responses: [{ service_code: currentServiceCode, answers: userResponses }] })
                });
            } catch (error) {
                setReasoningTrail([`Connection Error: ${error.message}`]);
            }
        }
    }

    // Restart session
    function handleRestart() {
        setSoapNote('');
        setAiThinking(false);
        setQuestionForm(false);
        setFinalDocument(false);
        setReasoningTrail([]);
        setServiceCodes([]);
        setFinalReasoningTrail([]);
        setWorkflowStages([]);
        setChatMessages([]);
        setQuestionIdx(0);
        setSoapSent(false);
        setUserResponses({});
        setTimeline([]);
        sessionId.current = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId.current);
        if (wsRef.current) wsRef.current.close();
    }

    // --- UI ---
    return (
        <div className=" bg-gray-50 font-inter flex flex-col">
            <div className="flex w-full" style={{ height: '70vh' }}>
                {/* Left: Chat Timeline (scrollable, 70%) */}
                <div className="flex w-full flex-col h-full bg-transparent" style={{ maxWidth: '70vw', minWidth: '0' }}>
                    <div className="h-full overflow-y-auto p-8 w-full">
                        {/* Render timeline from state */}
                        {timeline.map(item => {
                            if (item.type === 'chat') {
                                return (
                                    <div key={item.key} className={`flex ${item.side === 'right' ? 'justify-end' : 'justify-start'} mb-6`}>
                                        <div className={`max-w-lg flex ${item.side === 'right' ? 'items-end' : 'items-start'}  flex-col`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-8 h-8 ${item.side === 'right' ? 'bg-gray-300' : 'bg-primary'} rounded-full flex items-center justify-center text-white font-bold`}>{item.icon}</span>
                                                {item.name && <span className="text-xs text-primary font-semibold">{item.name}</span>}
                                            </div>
                                            <div className={`rounded-lg px-4 py-2 text-sm shadow ${item.side === 'right' ? 'bg-primary text-white text-right w-fit' : 'bg-gray-100 text-gray-800'}`}>{item.text}</div>
                                        </div>
                                    </div>
                                );
                            }
                            if (item.type === 'stage') {
                                return (
                                    <div key={item.key} className="flex justify-start mb-2">
                                        <div className="bg-white rounded-lg px-4 py-2 text-gray-700 shadow max-w-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-lg bg-primary text-white">{item.icon}</span>
                                                <span className="font-semibold">{item.name}</span>
                                            </div>
                                            <span className="text-gray-500 text-xs">{item.description}</span>
                                        </div>
                                    </div>
                                );
                            }
                            if (item.type === 'thinking') {
                                return (
                                    <div key={item.key} className="flex justify-start mb-2">
                                        <div className="max-w-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold animate-spin">{item.icon}</span>
                                                <span className="text-xs text-primary font-semibold">{item.name}</span>
                                            </div>
                                            <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800 text-sm shadow">{item.text}</div>
                                        </div>
                                    </div>
                                );
                            }
                            if (item.type === 'question') {
                                return (
                                    <div key={item.key} className="flex justify-start mb-2">
                                        <div className="max-w-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">{item.icon}</span>
                                                <span className="text-xs text-orange-500 font-semibold">{item.name}</span>
                                            </div>
                                            <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800 text-sm shadow">{item.text}</div>
                                        </div>
                                    </div>
                                );
                            }
                            if (item.type === 'final') {
                                return (
                                    <div key={item.key} className="flex justify-start mb-2">
                                        <div className="max-w-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">{item.icon}</span>
                                                <span className="text-xs text-green-600 font-semibold">{item.name}</span>
                                            </div>
                                            <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800 text-sm shadow">
                                                <div className="mb-6">
                                                    {item.serviceCodes.map((code, idx) => {
                                                        const severityColor = code.severity === 'fail' ? 'bg-red-500' : 'bg-green-500';
                                                        const severityLabel = code.severity === 'fail' ? '❌ Validation Failed' : '✅ Validation Passed';
                                                        const missingTerms = (code.missing_terms || []).map(term => (
                                                            <div key={term.term} className="flex justify-between items-center py-1"><span>{term.term}</span><span className={term.answered ? 'text-green-500' : 'text-red-500'}>{term.answered ? '✓' : '✗'}</span></div>
                                                        ));
                                                        const suggestions = (code.suggestions || []).map((s, i) => (
                                                            <li key={i} className="text-gray-600">{s}</li>
                                                        ));
                                                        return (
                                                            <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h3 className="text-xl font-bold text-gray-800">Service Code: {code.code}</h3>
                                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${severityColor}`}>{severityLabel}</span>
                                                                </div>
                                                                {missingTerms.length > 0 && (
                                                                    <div className="mb-3">
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Missing Terms:</h4>
                                                                        <div className="bg-white rounded-lg p-3 space-y-1 border border-gray-200">{missingTerms}</div>
                                                                    </div>
                                                                )}
                                                                {suggestions.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggestions:</h4>
                                                                        <ul className="list-disc list-inside text-sm space-y-1">{suggestions}</ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <button
                                                    className="w-full mt-4 py-3 px-6 rounded-lg font-semibold transition duration-300 bg-gray-600 text-white shadow hover:bg-gray-700"
                                                    onClick={handleRestart}
                                                >🔄 Start New Analysis</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                        {aiThinking && (
                            <div className={`flex justify-start mb-6`}>
                                <div className={`max-w-lg flex items-start  flex-col`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold`}>🤖</span>
                                        <span className="text-xs text-primary font-semibold">Processing....</span>
                                    </div>
                                    {/* <div className={`rounded-lg px-4 py-2 text-sm shadow ${item.side === 'right' ? 'bg-primary text-white text-right w-fit' : 'bg-gray-100 text-gray-800'}`}>{item.text}</div> */}
                                </div>
                            </div>
                        )
                        }
                    </div>
                    {/* Chat input at bottom: sticky only within left column */}
                    <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 z-10">
                        {/* Chat input at bottom: SOAP note only if not sent, question input only if SOAP sent and in questionForm */}
                        {!finalDocument && !soapSent && (
                            <form onSubmit={handleSoapSubmit} className="w-full flex items-center gap-2 px-8 py-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                        placeholder="Type your SOAP note..."
                                        value={soapNote}
                                        onChange={e => setSoapNote(e.target.value)}
                                        disabled={inputDisabled}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`py-3 px-6 rounded-lg font-semibold transition duration-300 shadow text-white bg-primary hover:bg-primary-dark`}
                                    disabled={inputDisabled || !soapNote.trim()}
                                >Send SOAP</button>
                            </form>
                        )}
                        {/* Question input at bottom */}
                        {!finalDocument && soapSent && questionForm && questionTerms.length > 0 && (
                            <form onSubmit={handleSend} className="w-full flex items-center gap-2 px-8 py-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-300"
                                        placeholder={`Enter ${questionTerms[questionIdx].toLowerCase()}...`}
                                        value={userResponses[questionTerms[questionIdx]] || ''}
                                        onChange={e => setUserResponses(r => ({ ...r, [questionTerms[questionIdx]]: e.target.value }))}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`py-3 px-6 rounded-lg font-semibold transition duration-300 shadow text-white bg-orange-400 hover:bg-orange-500`}
                                    disabled={inputDisabled || !userResponses[questionTerms[questionIdx]]?.trim()}
                                >Send</button>
                            </form>
                        )}
                    </div>
                </div>
                {/* Right: Reasoning Trail Panel (scrollable, 30%) */}
                <div className="w-[30vw] min-w-[320px] flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto bg-white p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">📋</div>
                            <h3 className="text-xl font-bold text-gray-800">Logs</h3>
                        </div>
                        <div className="space-y-3">
                            <pre className="text-gray-600 text-sm whitespace-pre-wrap">{finalReasoningTrail.join('\n')}</pre>
                        </div>
                    </div>
                </div>
            </div>
            {/* Analysis Complete section sticky at bottom, outside scrollable chat */}
            {finalDocument && (
                <div className="w-full bg-white border-t border-gray-200 shadow fixed left-0 bottom-0 z-20">
                    <div className="flex justify-center py-6">
                        <div className="max-w-2xl w-full">
                            {/* ...existing analysis complete rendering code... */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

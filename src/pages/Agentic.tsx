import React, { useEffect, useRef, useState } from 'react';
import { medicalClasses } from '@/theme/colors';
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
    <div className="bg-medical-surface text-medical-foreground antialiased min-h-screen font-inter">
            <div className="container mx-auto p-6">
                <div className="flex gap-8">
                    {/* LEFT PANEL */}
                    <div className="flex-1 space-y-6">
                        {/* SOAP Input */}
                        {!soapSent && !aiThinking && !questionForm && !finalDocument && (
                            <div className={medicalClasses.card + ' p-6 rounded-xl'}>
                                <h2 className="font-semibold mb-2">📝 Enter SOAP Note</h2>
                                <textarea
                                    rows={6}
                                    className={medicalClasses.input + ' w-full p-3 rounded text-sm'}
                                    placeholder="Enter SOAP note here..."
                                    value={soapNote}
                                    onChange={e => setSoapNote(e.target.value)}
                                    disabled={inputDisabled}
                                />
                                <button
                                    onClick={handleSoapSubmit}
                                    disabled={inputDisabled || !soapNote.trim()}
                                    className={medicalClasses.button.primary + ' w-full mt-3 p-3 rounded'}
                                >Analyse</button>
                            </div>
                        )}
                        {/* AI Thinking */}
                        {aiThinking && (
                            <div className={medicalClasses.card + ' p-6 rounded-xl'}>
                                <p>🤖 Processing...</p>
                                <pre className="text-xs whitespace-pre-wrap">{reasoningTrail.slice(-10).join('\n')}</pre>
                            </div>
                        )}
                        {/* Question Form */}
                        {questionForm && (
                            <div className={medicalClasses.card + ' p-6 rounded-xl space-y-2'}>
                                <p className="font-medium">{questionText}</p>
                                <form onSubmit={handleSend} id="responses-form">
                                    {questionTerms.map((term, idx) => (
                                        <div key={term} className="mb-2">
                                            <label className="block mt-2">{term}</label>
                                            <textarea
                                                className={medicalClasses.input + ' w-full p-2 rounded'}
                                                value={userResponses[term] || ''}
                                                onChange={e => setUserResponses(r => ({ ...r, [term]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className={medicalClasses.button.secondary + ' w-full p-2 rounded mt-2'}
                                    >Submit</button>
                                </form>
                            </div>
                        )}
                        {/* Final Document */}
                        {finalDocument && (
                            <div className={medicalClasses.card + ' p-6 rounded-xl'}>
                                <h3 className="font-bold text-lg mb-2">✅ Complete</h3>
                                <div>
                                    {serviceCodes.map((c, idx) => (
                                        <div key={idx} className={medicalClasses.card + ' p-4 rounded mb-2'}>
                                            <div className="flex justify-between">
                                                <strong>{c.code}</strong>
                                                <span>{c.severity === 'pass' ? '✅' : '❌'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <pre className="text-xs whitespace-pre-wrap mt-4">{finalReasoningTrail.join('\n')}</pre>
                                <button
                                    onClick={handleRestart}
                                    className={medicalClasses.button.primary + ' mt-4 p-2 rounded'}
                                >Start New</button>
                            </div>
                        )}
                    </div>
                    {/* RIGHT PANEL: Timeline */}
                    <div className="w-[320px] max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <div className={medicalClasses.card + ' p-4 rounded-xl space-y-3'}>
                            <h3 className="font-semibold mb-2">📊 Workflow Timeline</h3>
                            <div className="space-y-4 text-xs">
                                {workflowStages.length === 0 ? (
                                    <div className="text-slate-500 text-center py-6">Waiting...</div>
                                ) : (
                                    workflowStages.map((s, idx) => {
                                        const cfg = stageConfig[s.code];
                                        return (
                                            <React.Fragment key={s.code}>
                                                <div className={`stage-node flex space-x-2 p-2 rounded ${s.status === 'completed' ? 'bg-green-600/20' : s.status === 'current' ? 'bg-purple-600/20' : 'bg-slate-700/20'}`}>
                                                    <span>{cfg?.icon}</span>
                                                    <div className="flex-1 text-xs">{cfg?.name}</div>
                                                    <span>{s.status === 'current' ? '⏳' : s.status === 'completed' ? '✅' : ''}</span>
                                                </div>
                                                {idx < workflowStages.length - 1 && (
                                                    <div className={`h-[3px] rounded-full my-1 ${workflowStages[idx + 1].status !== 'pending' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-slate-700/40'}`}></div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

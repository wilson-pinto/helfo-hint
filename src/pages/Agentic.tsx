
import React, { useEffect, useRef, useState } from 'react';

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
    const wsRef = useRef(null);
    const sessionId = useRef(getSessionId());

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
                if (payload.stages) setWorkflowStages(payload.stages);
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
        setQuestionText(payload.question || "Please provide additional information.");
        setCurrentServiceCode(payload.predicted_service_codes?.[0]?.code || null);
        setQuestionTerms((payload.predicted_service_codes?.[0]?.missing_terms || []).filter(t => !t.answered).map(t => t.term));
        setUserResponses({});
    }

    function handleWorkflowFinished(payload) {
        setAiThinking(false);
        setQuestionForm(false);
        setFinalDocument(true);
        setServiceCodes(payload.predicted_service_codes || []);
        setFinalReasoningTrail(payload.reasoning_trail || []);
    }

    // Submit SOAP note
    async function handleSoapSubmit(e) {
        e.preventDefault();
        if (!soapNote.trim()) return alert('Please enter a SOAP note.');
        setAiThinking(true);
        setQuestionForm(false);
        setFinalDocument(false);
        setReasoningTrail(['AI Agent initializing...']);
        setWorkflowStages([]);
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

    // Respond to agent question
    async function handleSend(e) {
        e.preventDefault();
        let allFilled = true;
        questionTerms.forEach(term => {
            if (!userResponses[term]?.trim()) allFilled = false;
        });
        if (!allFilled) return alert('Please fill in all required fields.');
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
        sessionId.current = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId.current);
        if (wsRef.current) wsRef.current.close();
    }

    // --- UI ---
    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">🧠 Agentic AI Workflow</h1>
                    <p className="text-gray-500 text-lg">Intelligent SOAP Note Analysis & Validation</p>
                    <div className="mt-4">
                        <span className="px-4 py-2 rounded-full text-sm font-semibold text-yellow-700 bg-yellow-100 border border-yellow-200">{wsStatus}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Input & AI Processing */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Input Form */}
                        {!aiThinking && !questionForm && !finalDocument && (
                            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Enter SOAP Note</h2>
                                <form onSubmit={handleSoapSubmit}>
                                    <textarea
                                        value={soapNote}
                                        onChange={e => setSoapNote(e.target.value)}
                                        rows={6}
                                        className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                        placeholder="Enter your SOAP note here..."
                                    />
                                    <button
                                        type="submit"
                                        className="w-full mt-4 py-3 px-6 rounded-lg font-semibold transition duration-300 bg-primary text-white shadow hover:bg-primary-dark"
                                        disabled={inputDisabled || !soapNote.trim()}
                                    >🚀 Analyze with AI</button>
                                </form>
                            </div>
                        )}
                        {/* AI Thinking Panel */}
                        {aiThinking && (
                            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 animate-spin">🧠</div>
                                    <h2 className="text-xl font-semibold text-gray-800">AI Agent is Processing<span className="thinking-dots" /></h2>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <div className="flex items-center mb-2"><span className="text-primary text-sm font-semibold">💭 Agent Thoughts</span></div>
                                    <pre className="text-gray-600 text-sm whitespace-pre-wrap">{reasoningTrail.slice(-10).join('\n')}</pre>
                                </div>
                            </div>
                        )}
                        {/* Question Form */}
                        {questionForm && (
                            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center mr-3">❓</div>
                                    <h2 className="text-xl font-semibold text-gray-800">Agent Needs More Information</h2>
                                </div>
                                <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-400">{questionText}</p>
                                <form onSubmit={handleSend} className="space-y-4">
                                    {questionTerms.map(term => (
                                        <div key={term} className="space-y-2">
                                            <label htmlFor={term} className="block text-sm font-medium text-gray-700">{term}</label>
                                            <textarea
                                                id={term}
                                                name={term}
                                                rows={2}
                                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-300"
                                                placeholder={`Enter ${term.toLowerCase()}...`}
                                                value={userResponses[term] || ''}
                                                onChange={e => setUserResponses(r => ({ ...r, [term]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="w-full mt-4 py-3 px-6 rounded-lg font-semibold transition duration-300 bg-orange-400 text-white shadow hover:bg-orange-500"
                                    >📤 Submit Response to Agent</button>
                                </form>
                            </div>
                        )}
                        {/* Final Document */}
                        {finalDocument && (
                            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">✅</div>
                                    <h2 className="text-2xl font-bold text-gray-800">Analysis Complete!</h2>
                                </div>
                                <div className="mb-6">
                                    {serviceCodes.map((code, idx) => {
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
                                <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <div className="flex items-center mb-2"><span className="text-green-500 text-sm font-semibold">📋 Complete Reasoning Trail</span></div>
                                    <pre className="text-gray-600 text-sm whitespace-pre-wrap">{finalReasoningTrail.join('\n')}</pre>
                                </div>
                                <button
                                    className="w-full mt-4 py-3 px-6 rounded-lg font-semibold transition duration-300 bg-gray-600 text-white shadow hover:bg-gray-700"
                                    onClick={handleRestart}
                                >🔄 Start New Analysis</button>
                            </div>
                        )}
                    </div>
                    {/* Right: Workflow Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 sticky top-8 max-h-[calc(100vh-10rem)] overflow-y-auto">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">🔄</div>
                                <h3 className="text-xl font-bold text-gray-800">Workflow Pipeline</h3>
                            </div>
                            <div className="space-y-3">
                                {workflowStages.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">Agent is waiting for input...</div>
                                ) : (
                                    workflowStages.map((stage, index) => {
                                        const config = stageConfig[stage.code];
                                        if (!config) return null;
                                        return (
                                            <React.Fragment key={stage.code}>
                                                <div className={`stage-node ${stage.status}`}>
                                                    <div className={`flex items-center space-x-3 p-3 rounded-lg ${getStageBackgroundClass(stage.status)}`}>
                                                        <div className={`stage-icon ${stage.status}`}>{config.icon}</div>
                                                        <div className="flex-1">
                                                            <div className="text-gray-800 font-semibold text-sm">{config.name}</div>
                                                            <div className="text-gray-500 text-xs">{config.description}</div>
                                                        </div>
                                                        <div className="stage-status">{getStatusIndicator(stage.status)}</div>
                                                    </div>
                                                </div>
                                                {index < workflowStages.length - 1 && (
                                                    <div className={`stage-connector ${workflowStages[index + 1].status !== 'pending' ? 'active' : ''}`}></div>
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
            {/* Custom styles for stage transitions and connectors only */}
            <style>{`
                .stage-node { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
                .stage-connector { height:3px; border-radius:2px; overflow:hidden; background:linear-gradient(90deg,#4f46e5,#7c3aed,#ec4899);}
                .stage-connector.active::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent); animation: flow 2s ease-in-out infinite; }
                @keyframes flow {0%{left:-100%;}100%{left:100%;}}
            `}</style>
        </div>
    );
}

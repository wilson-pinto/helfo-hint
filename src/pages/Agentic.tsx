import * as React from 'react';

const stages = [
    { name: 'Extract Codes', key: 'extract' },
    { name: 'Validate', key: 'validate' },
    { name: 'Missing Data Request', key: 'missing' },
    { name: 'Final Update', key: 'final' },
];


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const EVENT_TYPES = {
    FINAL_DOCUMENT: 'final_document',
    WAITING_FOR_USER: 'waiting_for_user',
};

function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

export default function Agentic() {
    const [soapNote, setSoapNote] = React.useState('');
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState('');
    const [stageIdx, setStageIdx] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [showQuestion, setShowQuestion] = React.useState(false);
    const [wsStatus, setWsStatus] = React.useState('Connecting...');
    const [reasoningTrail, setReasoningTrail] = React.useState([]);
    const [finalDocument, setFinalDocument] = React.useState(null);
    const [serviceCodes, setServiceCodes] = React.useState([]);
    const [currentServiceCode, setCurrentServiceCode] = React.useState(null);
    const [questionText, setQuestionText] = React.useState('');
    const [questionTerms, setQuestionTerms] = React.useState([]);
    const [userResponses, setUserResponses] = React.useState({});
    const [stagesTrail, setStagesTrail] = React.useState([]);
    const wsRef = React.useRef(null);
    const sessionId = React.useRef(getSessionId());

    // Connect WebSocket
    React.useEffect(() => {
        setWsStatus('Connecting...');
        setStagesTrail([]);
        const wsUrl = `${BACKEND_URL.replace(/^http/, 'ws')}/ws/agentic-workflow/${sessionId.current}`;
        const ws = new window.WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => setWsStatus('Connected');
        ws.onclose = () => setWsStatus('Disconnected');
        ws.onerror = () => setWsStatus('Error');
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(data.event_type, data);

                const payload = data.payload;
                // Reasoning trail
                if (payload?.reasoning_trail) setReasoningTrail(payload.reasoning_trail);
                // Stages
                if (data.node) {
                    setStagesTrail((prev) => [...prev, data.node]);
                    setStageIdx(Math.min(stages.findIndex(s => s.key === data.node), stages.length - 1));
                }
                if (data.event_type === EVENT_TYPES.FINAL_DOCUMENT) {
                    setStagesTrail((prev) => [...prev, EVENT_TYPES.FINAL_DOCUMENT]);
                    setStageIdx(stages.length - 1);
                }
                // Question
                if (data.event_type === EVENT_TYPES.WAITING_FOR_USER) {
                    setShowQuestion(true);
                    setLoading(false);
                    setFinalDocument(null);
                    setQuestionText(payload.question);
                    // Extract terms from question
                    const termsString = payload.question.split(': ')[1];
                    setQuestionTerms(termsString ? termsString.split(', ') : []);
                    setCurrentServiceCode(payload.question.match(/service code (\w+)/)?.[1] || null);
                } else if (data.event_type === EVENT_TYPES.FINAL_DOCUMENT) {
                    setShowQuestion(false);
                    setLoading(false);
                    setFinalDocument(payload);
                    setServiceCodes(payload.predicted_service_codes || []);
                }
                // Chat messages
                if (payload?.chat) setMessages(payload.chat);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse WebSocket message:', e);
            }
        };
        return () => ws.close();
    }, [sessionId.current]);

    // Submit SOAP note
    const handleSoapSubmit = async (e) => {
        e.preventDefault();
        if (!soapNote.trim()) return;
        setLoading(true);
        setShowQuestion(false);
        setFinalDocument(null);
        setMessages([]);
        setReasoningTrail([]);
        try {
            await fetch(`${BACKEND_URL}/api/submit_soap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soap_text: soapNote, session_id: sessionId.current })
            });
        } catch (error) {
            setLoading(false);
            setReasoningTrail([`Error: ${error.message}`]);
        }
    };

    // Respond to agent question
    const handleSend = async (e) => {
        e.preventDefault();
        if (!currentServiceCode) return;
        if (questionTerms.some(term => !userResponses[term]?.trim())) {
            alert('Please answer all requested terms.');
            return;
        }
        setLoading(true);
        setShowQuestion(false);
        try {
            await fetch(`${BACKEND_URL}/api/respond?session_id=${sessionId.current}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses: [{ service_code: currentServiceCode, answers: userResponses }] })
            });
        } catch (error) {
            setLoading(false);
            setReasoningTrail([`Error: ${error.message}`]);
        }
    };

    // Restart session
    const handleRestart = () => {
        setSoapNote('');
        setMessages([]);
        setReasoningTrail([]);
        setFinalDocument(null);
        setServiceCodes([]);
        setShowQuestion(false);
        setLoading(false);
        setStagesTrail([]);
        sessionId.current = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId.current);
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen font-inter">
            <div className="p-10">
                <div className="text-center mb-4 text-sm font-semibold text-gray-500">
                    <span>{wsStatus}</span>
                </div>
                <div className="flex">
                    {/* Workflow Steps */}
                    <div className="flex flex-col items-start mr-8 pt-2">
                        {stages.map((stage, idx) => (
                            <div key={stage.key} className="flex items-center mb-6">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 border-2 ${idx <= stageIdx ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-300'}`}>{idx + 1}</div>
                                <span className={`font-medium text-base ${idx <= stageIdx ? 'text-blue-700' : 'text-gray-400'}`}>{stage.name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Main Panel */}
                    <div className="flex-1">
                        {/* SOAP Input */}
                        {!messages.length && !loading && !showQuestion && !finalDocument && (
                            <form onSubmit={handleSoapSubmit} className="space-y-4">
                                <p className="text-gray-600 text-center">Enter your SOAP note below to get started. The agent will validate the content and provide a recommendation.</p>
                                <textarea
                                    value={soapNote}
                                    onChange={e => setSoapNote(e.target.value)}
                                    rows={6}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    placeholder="e.g., A patient presents with internal hemorrhoids and the surgical plan is to use Milligan's technique for evaluation and management."
                                />
                                <button
                                    type="submit"
                                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 ${soapNote ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                    disabled={!soapNote}
                                >
                                    Validate SOAP Note
                                </button>
                            </form>
                        )}
                        {/* Loading Spinner */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full mb-4"></div>
                                <p className="text-lg font-semibold text-blue-600 mb-2">Agent is working...</p>
                                <p className="text-gray-500 text-sm mb-4">Please wait while the agent processes your request.</p>
                                <div className="text-left bg-gray-200 p-4 rounded-lg shadow-inner max-h-96 overflow-y-auto">
                                    <p className="font-bold text-gray-700 mb-2">Reasoning Trail:</p>
                                    <pre className="text-gray-600 text-sm whitespace-pre-wrap">{reasoningTrail.join('\n')}</pre>
                                </div>
                            </div>
                        )}
                        {/* Chat UI */}
                        {!loading && messages.length > 0 && !finalDocument && (
                            <div className="space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'agent' ? (
                                            <div className="flex items-start gap-2">
                                                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                                                    <span className="text-blue-600 text-lg font-bold">🤖</span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-blue-700 mb-1">{msg.name}</div>
                                                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800 text-sm shadow-sm">{msg.text}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-end gap-2">
                                                <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                                                    <span className="text-gray-700 text-lg font-bold">🧑</span>
                                                </div>
                                                <div>
                                                    <div className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm shadow-sm">{msg.text}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Question Input */}
                        {showQuestion && (
                            <form onSubmit={handleSend} className="space-y-4 mt-2">
                                <p className="text-lg font-semibold text-gray-700 text-center mb-2">{questionText}</p>
                                {questionTerms.map(term => (
                                    <div key={term} className="flex flex-col space-y-1">
                                        <label htmlFor={term} className="text-sm font-medium text-gray-700">{term}</label>
                                        <textarea
                                            id={term}
                                            name={term}
                                            rows={2}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            value={userResponses[term] || ''}
                                            onChange={e => setUserResponses(r => ({ ...r, [term]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Submit Response
                                </button>
                            </form>
                        )}
                        {/* Final Document */}
                        {finalDocument && (
                            <div>
                                <h2 className="text-2xl font-bold text-center text-green-600 mb-4">Validation Complete!</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        {serviceCodes.map((code, idx) => (
                                            <div key={idx} className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                                <h3 className="font-bold text-lg mb-2">Service Code: {code.code}</h3>
                                                <p className="mb-2"><span className="font-bold">Status:</span> <span className={code.severity === 'fail' ? 'text-red-600' : 'text-green-600'}>{code.severity === 'fail' ? 'Failed' : 'Success'}</span></p>
                                                <div className="mb-2">
                                                    <p className="font-semibold">Missing Terms:</p>
                                                    <ul className="list-disc list-inside text-gray-600">
                                                        {(code.missing_terms || []).map((term, i) => (
                                                            <li key={i}><strong>Term:</strong> {term.term} <strong>Answered:</strong> {term.answered} <strong>Input:</strong> {term.user_input || 'N/A'}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="font-semibold">Suggestions:</p>
                                                    <ul className="list-disc list-inside text-gray-600">
                                                        {(code.suggestions || []).map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-gray-200 rounded-lg shadow-inner max-h-96 overflow-y-auto">
                                        <p className="font-bold text-gray-700 mb-2">Full Reasoning Trail:</p>
                                        <pre className="text-gray-600 text-sm whitespace-pre-wrap">{(finalDocument.reasoning_trail || []).join('\n')}</pre>
                                    </div>
                                </div>
                                <button
                                    className="mt-4 w-full py-3 px-4 rounded-lg text-white font-semibold bg-gray-600 hover:bg-gray-700 transition duration-300"
                                    onClick={handleRestart}
                                >
                                    Start a New Session
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Stages Trail Panel */}
                    <div id="stages-trail" className="absolute top-8 right-[-280px] w-[260px] max-h-[70vh] overflow-y-auto p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-md">
                        <h3 className="font-bold mb-2 text-gray-700">Workflow Stages</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {stagesTrail.map((stage, idx) => (
                                <li key={idx} className="p-1 rounded hover:bg-gray-200">{stage}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

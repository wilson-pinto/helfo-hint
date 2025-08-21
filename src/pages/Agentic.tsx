import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Download } from 'lucide-react';

const BACKEND_URL = "http://localhost:8000";

const stageConfig = {
    pii_detection: { name: "PII Detection", icon: "🔍", description: "Scanning for sensitive data" },
    anonymize_pii: { name: "Anonymization", icon: "🛡️", description: "Masking sensitive info" },
    predict_service_codes: { name: "Prediction", icon: "🎯", description: "Predicting codes" },
    rerank_service_codes: { name: "Rerank", icon: "📊", description: "Selecting best code" },
    validate_soap: { name: "Validation", icon: "✅", description: "Checking compliance" },
    check_referral_required: { name: "Check Referral", icon: "🏥", description: "Does referral needed?" },
    execute_referral: { name: "Referral", icon: "📨", description: "Trigger referral logic" },
    generate_referral_draft: { name: "Draft Referral", icon: "✉️", description: "Generate referral draft" },
    question_generation: { name: "Clarifications", icon: "❓", description: "Need more details" },
    output: { name: "Output", icon: "📄", description: "Finalizing" },
    patient_summary: { name: "Summary", icon: "🧾", description: "Patient summary" },
    patient_summary_pdf: { name: "PDF", icon: "📥", description: "Generating PDF" },
    dummy_end: { name: "End", icon: "🏁", description: "Workflow completed" },
};
const stageOrder = Object.keys(stageConfig);

function Agentic() {
    // State
    const [soapText, setSoapText] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [allStages, setAllStages] = useState<any[]>([]);
    const [reasoningTrail, setReasoningTrail] = useState<string[]>([]);
    const [aiThinking, setAiThinking] = useState(false);
    const [question, setQuestion] = useState<string | null>(null);
    const [missingTerms, setMissingTerms] = useState<any[]>([]);
    const [currentServiceCode, setCurrentServiceCode] = useState<string | null>(null);
    const [finalPayload, setFinalPayload] = useState<any>(null);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showFinalDocument, setShowFinalDocument] = useState(false);
    const [activeTab, setActiveTab] = useState<"patient" | "clinical">("patient");
    const responsesRef = useRef<{ [key: string]: string }>({});

    // WebSocket setup
    useEffect(() => {
        const id = crypto.randomUUID();
        setSessionId(id);
        const socket = new window.WebSocket(`ws://localhost:8000/ws/agentic-workflow/${id}`);
        setWs(socket);

        socket.onopen = () => { };
        socket.onmessage = (e) => {
            const m = JSON.parse(e.data), p = m.payload || {};
            if (p.stages) updateStagesFromState(p.stages);
            if (p.reasoning_trail) setReasoningTrail(p.reasoning_trail);

            if (m.event_type === "waiting_for_user") handleWaitingForUser(p);
            if (m.event_type === "workflow_finished") handleWorkflowFinished(p);
        };

        return () => {
            socket.close();
        };
        // eslint-disable-next-line
    }, []);

    // Stage helpers
    function initializeWorkflowStages() {
        setAllStages([]);
    }

    function updateStagesFromState(stages: any[]) {
        if (!stages) return;
        const executed = stages.map((s) => s.code);
        const last = executed.at(-1);
        let newStages: any[] = [];
        stages.forEach((p) => {
            if (!newStages.some((x) => x.name === p.code)) {
                newStages.splice(stageOrder.indexOf(p.code), 0, { name: p.code, status: "pending" });
            }
        });
        newStages = newStages.length ? newStages : allStages;
        newStages.forEach((s) => {
            s.status = executed.includes(s.name)
                ? s.name === last
                    ? "current"
                    : "completed"
                : "pending";
        });
        setAllStages([...newStages]);
    }

    // Reasoning trail
    function updateReasoningTrail(trail: string[]) {
        setReasoningTrail(trail.slice(-10));
    }

    // WebSocket handlers
    function handleWaitingForUser(p: any) {
        setAiThinking(false);
        setShowQuestionForm(true);
        setCurrentServiceCode(p.predicted_service_codes?.[0]?.code || null);
        setQuestion(p.question || "Please supply information:");
        setMissingTerms(p.predicted_service_codes?.[0]?.missing_terms || []);
    }

    function handleWorkflowFinished(p: any) {
        setAiThinking(false);
        setShowQuestionForm(false);
        setShowFinalDocument(true);
        setFinalPayload(p);
    }

    // Download handlers
    function downloadPDF() {
        window.open(`${BACKEND_URL}/api/download_pdf/${sessionId}`, "_blank");
    }
    function downloadReferral() {
        window.open(`${BACKEND_URL}/api/download_eml/${sessionId}`, "_blank");
    }

    // Submit SOAP
    async function handleSubmitSOAP() {
        if (!soapText.trim()) return;
        setAiThinking(true);
        initializeWorkflowStages();
        setShowQuestionForm(false);
        setShowFinalDocument(false);
        await fetch(`${BACKEND_URL}/api/submit_soap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ soap_text: soapText.trim(), session_id: sessionId }),
        });
    }

    // Respond to question
    async function handleRespond() {
        const answers: { [key: string]: string } = {};
        for (const mt of missingTerms) {
            const val = responsesRef.current[mt.term] || "";
            if (!val.trim()) return alert("Please fill all");
            answers[mt.term] = val.trim();
        }
        setShowQuestionForm(false);
        setAiThinking(true);
        await fetch(`${BACKEND_URL}/api/respond?session_id=${sessionId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responses: [{ service_code: currentServiceCode, answers }] }),
        });
    }

    // Restart workflow
    function handleRestart() {
        window.location.reload();
    }

    // Tab switch
    function switchTab(tab: "patient" | "clinical") {
        setActiveTab(tab);
    }

    // Render
    return (
        <div className="bg-background text-foreground antialiased rounded-lg">
            <div className="container mx-auto px-6">
                <div className="flex gap-8">
                    {/* Timeline LEFT */}
                    <div className="w-[320px] border-e py-5">
                        <h3 className="font-semibold mb-2 text-medical-foreground/80 text-2xl leading-none tracking-tight">Workflow Timeline</h3>
                        <div className="bg-card pe-4 space-y-3 rounded-xl h-[calc(70vh-4rem)] overflow-y-auto">
                            <div className="space-y-4 text-xs">
                                {allStages.map((s, i) => {
                                    const c = stageConfig[s.name];
                                    return (
                                        <div key={s.name} className={`p-3 flex space-x-3 border-b rounded ${s.status === "current"
                                            ? "bg-accent/20"
                                            : s.status === "completed"
                                                ? "bg-success/20"
                                                : "bg-subtle/20"
                                            }`}>
                                            <span>{c.icon}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-900">{c.name}</div>
                                                <div className="text-[11px] text-gray-900">{c.description}</div>
                                            </div>
                                            <div className="text-gray-900">
                                                {s.status === "current"
                                                    ? "⏳"
                                                    : s.status === "completed"
                                                        ? "✅"
                                                        : ""}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Workflow RIGHT */}
                    <div className="flex-1 space-y-6">
                        {/* Input Form */}
                        {!aiThinking && !showQuestionForm && !showFinalDocument && (
                            <div className="bg-card rounded-xl p-6">
                                <h2 className="font-semibold mb-3 text-medical-foreground/80 text-2xl leading-none tracking-tight">Enter SOAP Note</h2>
                                <Textarea
                                    rows={6}
                                    className="text-gray-900"
                                    placeholder="Enter SOAP note here..."
                                    value={soapText}
                                    onChange={(e) => setSoapText(e.target.value)}
                                />
                                <Button
                                    className="w-full mt-3"
                                    onClick={handleSubmitSOAP}
                                    disabled={!ws || !soapText.trim()}
                                >
                                    Analyse
                                </Button>
                            </div>
                        )}

                        {/* AI Thinking */}
                        {aiThinking && (
                            <div className="bg-card rounded-xl p-6">
                                <p className="text-gray-900">🤖 Processing...</p>
                                <pre className="text-xs whitespace-pre-wrap text-gray-900">{reasoningTrail.join("\n")}</pre>
                            </div>
                        )}

                        {/* Question Form */}
                        {showQuestionForm && (
                            <div className="bg-card rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">🤖</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-medical-primary mb-1">AI needs your help!</div>
                                        <div className="text-sm text-gray-700">To continue, the AI needs more information from you. Please answer the following:</div>
                                    </div>
                                </div>
                                <div className="bg-medical-primary/10 border border-medical-primary rounded p-4 mb-4">
                                    <span className="font-medium text-medical-primary">{question}</span>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleRespond();
                                    }}
                                    id="responses-form"
                                >
                                    {missingTerms.map((mt) => {
                                        const id = mt.term.toLowerCase().replace(/\s/g, "-");
                                        return (
                                            <div key={id} className="mb-4">
                                                <Label htmlFor={id} className="block uppercase font-semibold text-sm text-gray-900 mb-1">
                                                    {mt.term}
                                                </Label>
                                                <Textarea
                                                    id={id}
                                                    name={mt.term}
                                                    className="text-gray-900"
                                                    onChange={(e) => {
                                                        responsesRef.current[mt.term] = e.target.value;
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                    <Button
                                        variant="default"
                                        type="submit"
                                        className="w-full mt-3"
                                    >
                                        Send Help & Continue
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Final Document */}
                        {showFinalDocument && finalPayload && (
                            <div className="bg-card rounded-xl p-6">
                                <Tabs value={activeTab} onValueChange={switchTab} className="mb-4">
                                    <TabsList>
                                        <TabsTrigger value="patient">Patient Summary</TabsTrigger>
                                        <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="patient">
                                        <p className="mb-4 whitespace-pre-line text-gray-900">
                                            {finalPayload.patient_summary || "No summary available."}
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mr-2"
                                            onClick={downloadPDF}
                                        >
                                            <Download /> Download PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={downloadReferral}
                                        >
                                            Download Referral Draft
                                        </Button>
                                    </TabsContent>
                                    <TabsContent value="clinical">
                                        {(finalPayload.predicted_service_codes || []).map((c: any) => (
                                            <div key={c.code} className="p-3 mb-3 bg-subtle rounded">
                                                <div className="font-semibold text-gray-900">
                                                    {c.code} ({c.severity})
                                                </div>
                                                <div className="text-xs text-gray-900">
                                                    {(c.suggestions || []).join(" ")}
                                                </div>
                                            </div>
                                        ))}
                                        <pre className="text-[11px] mt-4 text-gray-900">
                                            {(finalPayload.reasoning_trail || []).join("\n")}
                                        </pre>
                                    </TabsContent>
                                </Tabs>
                                <Button
                                    variant="default"
                                    className="mt-4"
                                    onClick={handleRestart}
                                >
                                    Start New
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Agentic;
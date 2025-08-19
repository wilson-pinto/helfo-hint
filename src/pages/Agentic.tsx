import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
// import colors from "../theme/colors"; // Uncomment if you export colors

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
        <div className="bg-background text-foreground antialiased">
            <div className="container mx-auto px-6">
                <div className="flex gap-8">
                    {/* Timeline LEFT */}
                    <div className="w-[320px] max-h-[calc(70vh-4rem)] overflow-y-auto">
                        <Card className="bg-card p-4 space-y-3 border-e">
                            <CardHeader>
                                <h3 className="font-semibold mb-2 text-gray-900">Workflow Timeline</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-xs">
                                    {allStages.map((s, i) => {
                                        const c = stageConfig[s.name];
                                        return (
                                            <React.Fragment key={s.name}>
                                                <Card className={`p-3 flex space-x-3 border-b rounded ${s.status === "current"
                                                    ? "bg-accent/20"
                                                    : s.status === "completed"
                                                        ? "bg-success/20"
                                                        : "bg-subtle/20"
                                                    }`}>
                                                    <CardContent className="flex items-center space-x-3 p-0">
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
                                                    </CardContent>
                                                </Card>
                                                {/* {i < allStages.length - 1 && (
                                                        <div
                                                            className={`h-2 rounded-full my-1 ${allStages[i + 1].status !== "pending"
                                                                ? "bg-accent"
                                                                : "bg-muted/40"
                                                                }`}
                                                        ></div>
                                                    )} */}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Workflow RIGHT */}
                    <div className="flex-1 space-y-6">
                        {/* Input Form */}
                        {!aiThinking && !showQuestionForm && !showFinalDocument && (
                            <Card className="bg-card">
                                <CardHeader>
                                    <h2 className="font-semibold mb-2 text-gray-900">📝 Enter SOAP Note</h2>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        )}

                        {/* AI Thinking */}
                        {aiThinking && (
                            <Card className="bg-card p-6">
                                <CardContent>
                                    <p className="text-gray-900">🤖 Processing...</p>
                                    <pre className="text-xs whitespace-pre-wrap text-gray-900">{reasoningTrail.join("\n")}</pre>
                                </CardContent>
                            </Card>
                        )}

                        {/* Question Form */}
                        {showQuestionForm && (
                            <Card className="bg-card p-6">
                                <CardContent>
                                    <p className="font-medium text-gray-900 mb-4">{question}</p>
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
                                                <div key={id} className="mb-2">
                                                    <Label htmlFor={id} className="block font-semibold text-sm text-gray-900 mb-1">
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
                                            type="submit"
                                            className="w-full mt-3"
                                        >
                                            Submit
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Final Document */}
                        {showFinalDocument && finalPayload && (
                            <Card className="bg-card p-6">
                                <CardContent>
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
                                                📄 Download PDF
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={downloadReferral}
                                            >
                                                ✉️ Download Referral Draft
                                            </Button>
                                        </TabsContent>
                                        <TabsContent value="clinical">
                                            {(finalPayload.predicted_service_codes || []).map((c: any) => (
                                                <Card key={c.code} className="p-3 mb-3 bg-subtle">
                                                    <CardContent>
                                                        <div className="font-semibold text-gray-900">
                                                            {c.code} ({c.severity})
                                                        </div>
                                                        <div className="text-xs text-gray-900">
                                                            {(c.suggestions || []).join(" ")}
                                                        </div>
                                                    </CardContent>
                                                </Card>
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
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Agentic;
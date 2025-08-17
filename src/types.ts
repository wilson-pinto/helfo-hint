
export type TScreen = 'code-guessing' | 'code-validation' | 'agentic';

export interface ISOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  characterCount: {
    subjective: number;
    objective: number;
    assessment: number;
    plan: number;
  };
}

export interface ICodeSuggestion {
  id: string;
  code: string;
  description: string;
  reason: string
  type: 'diagnosis' | 'service';
  system: 'ICD-10' | 'ICPC-2' | 'HELFO' | 'Tjenestekoder';
  confidence: number;
  accepted?: boolean;
  validationStatus?: {
    compliance: "fail" | "pass" | "warn";
    message: string;
    compatibleWithDiagnoses?: boolean;
  };
}
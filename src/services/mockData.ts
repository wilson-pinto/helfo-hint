import { ICodeSuggestion } from "@/types";

export const diagnosisCodes: ICodeSuggestion[] = [
  {
    id: "diag-001",
    code: "K35.30",
    description: "Acute appendicitis with localized peritonitis, without perforation or gangrene",
    type: "diagnosis",
    system: "ICD-10",
    confidence: 0.95,
    accepted: false,
    validationStatus: {
      isValid: true,
      message: "Best match for uncomplicated acute appendicitis",
      compatibleWithDiagnoses: true
    }
  },
  {
    id: "diag-002",
    code: "K35.31",
    description: "Acute appendicitis with localized peritonitis and gangrene, without perforation",
    type: "diagnosis",
    system: "ICD-10",
    confidence: 0.60,
    accepted: false,
    validationStatus: {
      isValid: true,
      message: "Includes gangrene—less likely in this scenario",
      compatibleWithDiagnoses: true
    }
  },
  {
    id: "diag-003",
    code: "K35.890",
    description: "Other acute appendicitis without perforation or gangrene",
    type: "diagnosis",
    system: "ICD-10",
    confidence: 0.50,
    accepted: false,
    validationStatus: {
      isValid: true,
      message: "More general fallback classification",
      compatibleWithDiagnoses: true
    }
  }
];

export const serviceCodes: ICodeSuggestion[] = [
  {
    id: "svc-001",
    code: "47.01",
    description: "Laparoscopic appendectomy (ICD-9‑CM procedural code)",
    type: "service",
    system: "ICD-10", // using ICD‑9 code as placeholder; adjust to specific system if needed
    confidence: 0.90,
    accepted: false,
    validationStatus: {
      isValid: true,
      message: "Matches planned surgical treatment",
      compatibleWithDiagnoses: true
    }
  }
];


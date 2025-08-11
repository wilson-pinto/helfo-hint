import axios from 'axios';
import { CodeSuggestion } from '../store/slices/medicalSlice';

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse {
  data: Array<{
    code: string;
    description: string;
    system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder";
    confidenceLevel: number;
  }>;
  status: number;
  message: string;
}

export interface CodeSuggestionSimple {
  code: string;
  description: string;
  system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder";
}

export const generateCodeSuggestions = async (soapNote: string): Promise<{
  diagnosisCodes: CodeSuggestion[];
  serviceCodes: CodeSuggestion[];
  errors?: {
    diagnosis?: string;
    service?: string;
  };
}> => {
  const diagnosisCodes: CodeSuggestion[] = [];
  const serviceCodes: CodeSuggestion[] = [];
  const errors: { diagnosis?: string; service?: string } = {};

  try {
    // Call for diagnosis codes
    const diagnosisResponse = await axios.post<ApiResponse>(`${API_URL}/extract-diagnoses`, {
      subjective: soapNote,
      objective: soapNote,
      assessment: soapNote,
      plan: soapNote
    });

    if (diagnosisResponse.data.status === 1) {
      diagnosisCodes.push(...diagnosisResponse.data.data.map((code, index) => ({
        id: `diag-${index}`,
        code: code.code,
        description: code.description,
        type: 'diagnosis' as const,
        system: code.system,
        confidence: code.confidenceLevel,
      })));
    } else {
      errors.diagnosis = diagnosisResponse.data.message || 'Failed to get diagnosis codes';
    }
  } catch (error) {
    console.error('Error fetching diagnosis codes:', error);
    errors.diagnosis = error instanceof Error ? error.message : 'Failed to fetch diagnosis codes';
  }

  try {
    // Call for service codes
    const serviceResponse = await axios.post<ApiResponse>(`${API_URL}/extract-diagnoses`, {
      subjective: soapNote,
      objective: soapNote,
      assessment: soapNote,
      plan: soapNote
    });

    if (serviceResponse.data.status === 1) {
      serviceCodes.push(...serviceResponse.data.data.map((code, index) => ({
        id: `service-${index}`,
        code: code.code,
        description: code.description,
        type: 'service' as const,
        system: code.system,
        confidence: code.confidenceLevel,
      })));
    } else {
      errors.service = serviceResponse.data.message || 'Failed to get service codes';
    }
  } catch (error) {
    console.error('Error fetching service codes:', error);
    errors.service = error instanceof Error ? error.message : 'Failed to fetch service codes';
  }

  return {
    diagnosisCodes: diagnosisCodes.sort((a, b) => b.confidence - a.confidence),
    serviceCodes: serviceCodes.sort((a, b) => b.confidence - a.confidence),
    ...(Object.keys(errors).length > 0 ? { errors } : {})
  };
};

export const getSuggestions = async (system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder"): Promise<CodeSuggestionSimple[]> => {
  try {
    const response = await axios.get<{ data: CodeSuggestionSimple[] }>(`${API_URL}/codes/${system}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${system} suggestions:`, error);
    return [];
  }
};

export const validateCode = async (code: string): Promise<{ 
  isValid: boolean; 
  message: string; 
  code?: CodeSuggestion;
  error?: string;
}> => {
  try {
    const response = await axios.get(`${API_URL}/validate-code/${code}`);
    
    if (response.data.isValid) {
      return {
        isValid: true,
        message: `Valid ${response.data.code.system} code: ${response.data.code.description}`,
        code: {
          id: `manual-${Date.now()}`,
          code: response.data.code.code,
          description: response.data.code.description,
          type: 'diagnosis' as const,
          system: response.data.code.system,
          confidence: 100,
        },
      };
    }

    return {
      isValid: false,
      message: response.data.message || 'Code not found in medical code systems',
    };
  } catch (error) {
    console.error('Error validating code:', error);
    return {
      isValid: false,
      message: 'Error validating code',
      error: error instanceof Error ? error.message : 'Failed to validate code'
    };
  }
};
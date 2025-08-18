import axios from 'axios';
import { diagnosisCodes, serviceCodes } from './mockData';
import { ICodeSuggestion, IDiagnosisCodeSuggestion } from '@/types';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK_DATA = +(import.meta.env.VITE_USE_MOCK_DATA || 0) == 1;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export const networkService = {
  diagnoses: {
    extract: async (soapNote: string) => {
      if (USE_MOCK_DATA) {
        return Promise.resolve(diagnosisCodes);
      }
      return api.post('/extract-diagnoses', { soap: soapNote }).then(response => {
        const tempDiagnosisCodes = []
        // TODO: below is temp solution figure out better aproach
        return response.data.detailed_matches as IDiagnosisCodeSuggestion
      });
    },

    validate: async (code: string) => {
      if (USE_MOCK_DATA) {
        const mockCode = diagnosisCodes.find(c => c.code === code);
        return Promise.resolve({
          data: {
            status: 1,
            data: {
              isValid: true,
              code: mockCode || {
                code,
                description: 'Mock Diagnosis',
                system: 'ICD-10' as const,
              },
            },
            message: 'Success',
          },
        });
      }
      return api.get<ApiResponse<{
        isValid: boolean;
        code?: {
          code: string;
          description: string;
          system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder";
        };
      }>>(`/validate-code/${code}`);
    }
  },

  services: {

    extract: async (soapNote: string) => {

      if (USE_MOCK_DATA) {
        return Promise.resolve(serviceCodes);
      }
      const response = await api.post('/suggest-service-codes', {
        "query": soapNote,
        "top_k": 5,
        "session_id": "wqqweqeqw"
      });

      return response.data.decision.map(code => {
        return {
          code: code.code,
          description: code.reason,
        } as ICodeSuggestion
      })
    },

    validate: async (soap: string, serviceCodes: string[]) => {
      // if (USE_MOCK_DATA) {
      //   // const mockCode = serviceCodes.find(c => c.code === code);
      //   return Promise.resolve({
      //     data: {
      //       status: 1,
      //       data: {
      //         isValid: true,
      //         compatibleWithDiagnoses: true,
      //         message: mockCode ? `Valid service code: ${mockCode.description}` : 'Valid service code',
      //       },
      //       message: 'Success',
      //     },
      //   });
      // }
      return api.post<any>(`/v2/check-note-requirements`, { soap, service_codes: serviceCodes })
        .then((response) => {
          return response.data?.results?.map(result => {
            return {
              id: `service-${result.service_code}`,
              code: result.service_code,
              validationStatus: {
                compliance: result.compliance,
                // compatibleWithDiagnoses: result.compatible_with_diagnoses,
                message: result.suggestions?.join(", ") || "No suggestions",
              }
            } as ICodeSuggestion;
          })
        });
    }
  },

  codes: {
    search: async (system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder", query: string) => {
      if (USE_MOCK_DATA) {
        const mockCodes = system === 'ICD-10' ? diagnosisCodes : serviceCodes;
        return Promise.resolve({
          data: {
            status: 1,
            data: mockCodes.filter(c =>
              c.code.toLowerCase().includes(query.toLowerCase()) ||
              c.description.toLowerCase().includes(query.toLowerCase())
            ),
            message: 'Success',
          },
        });
      }
      return api.get<ApiResponse<Array<{
        code: string;
        description: string;
        system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder";
      }>>>(`/codes/${system}/search`, {
        params: { query }
      });
    }
  },
  validateCodes: async (type, codes: any[]) => {
    if (USE_MOCK_DATA) {
      const mockCodes = type === 'ICD-10' ? diagnosisCodes : serviceCodes;
      return Promise.resolve({
        data: {
          status: 1,
          data: mockCodes,
          message: 'Success',
        },
      });
    }
    return api.get<ApiResponse<Array<{
      code: string;
      description: string;
      system: "ICD-10" | "ICPC-2" | "HELFO" | "Tjenestekoder";
    }>>>(`/codes/${type}/search`, {
      params: { codes }
    });
  }
};
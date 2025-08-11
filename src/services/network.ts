import axios from 'axios';
import { diagnosisCodes, serviceCodes } from './mockData';
import { ICodeSuggestion } from '@/types';

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
        response.data.detailed_matches.forEach((matches: any) => {
          matches.matches.forEach((match: any, index: number) => {
            if (match.code) {
              tempDiagnosisCodes.push({
                id: `${index}`,
                code: match.code,
                description: match.description,
                system: match.system
              });
            }
          })
        });
        return tempDiagnosisCodes;
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
      return Promise.resolve([])
      if (USE_MOCK_DATA) {
        return Promise.resolve(serviceCodes);
      }
      return api.post<ICodeSuggestion[]>('/extract-services', { soap: soapNote });
    },

    validate: async (code: string, diagnosisCodes: string[]) => {
      if (USE_MOCK_DATA) {
        const mockCode = serviceCodes.find(c => c.code === code);
        return Promise.resolve({
          data: {
            status: 1,
            data: {
              isValid: true,
              compatibleWithDiagnoses: true,
              message: mockCode ? `Valid service code: ${mockCode.description}` : 'Valid service code',
            },
            message: 'Success',
          },
        });
      }
      return api.post<ApiResponse<{
        isValid: boolean;
        compatibleWithDiagnoses: boolean;
        message: string;
      }>>(`/validate-service/${code}`, { diagnosisCodes });
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
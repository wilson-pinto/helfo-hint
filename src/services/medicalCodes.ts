import { CodeSuggestion } from '../store/slices/medicalSlice';

// Mock data for Norwegian medical codes
const mockDiagnosisCodes = [
  { code: 'A09', description: 'Gastroenteritis', system: 'ICD-10' as const },
  { code: 'J06', description: 'Acute upper respiratory infection', system: 'ICD-10' as const },
  { code: 'K59.1', description: 'Diarrhea', system: 'ICD-10' as const },
  { code: 'R50', description: 'Fever', system: 'ICD-10' as const },
  { code: 'D78', description: 'Digestive problem', system: 'ICPC-2' as const },
  { code: 'R74', description: 'Upper respiratory infection', system: 'ICPC-2' as const },
];

const mockServiceCodes = [
  { code: '2ae', description: 'GP Consultation', system: 'HELFO' as const },
  { code: '1ae', description: 'Emergency visit', system: 'HELFO' as const },
  { code: '2ak', description: 'Extended consultation', system: 'HELFO' as const },
  { code: '1be', description: 'Home visit', system: 'Tjenestekoder' as const },
];

export const generateCodeSuggestions = async (soapNote: string): Promise<CodeSuggestion[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const suggestions: CodeSuggestion[] = [];
  const lowerText = soapNote.toLowerCase();
  
  // Simple keyword matching for demo purposes
  mockDiagnosisCodes.forEach((code, index) => {
    let confidence = 0;
    if (lowerText.includes('stomach') || lowerText.includes('nausea') || lowerText.includes('vomiting')) {
      if (code.code === 'A09') confidence = 92;
      if (code.code === 'K59.1') confidence = 75;
    }
    if (lowerText.includes('cough') || lowerText.includes('throat') || lowerText.includes('cold')) {
      if (code.code === 'J06') confidence = 85;
      if (code.code === 'R74') confidence = 78;
    }
    if (lowerText.includes('fever') || lowerText.includes('temperature')) {
      if (code.code === 'R50') confidence = 88;
    }
    
    if (confidence > 0) {
      suggestions.push({
        id: `diag-${index}`,
        code: code.code,
        description: code.description,
        type: 'diagnosis',
        system: code.system,
        confidence,
      });
    }
  });

  // Add service code suggestions
  mockServiceCodes.forEach((code, index) => {
    let confidence = 0;
    if (lowerText.includes('consultation') || lowerText.includes('examination')) {
      if (code.code === '2ae') confidence = 95;
      if (code.code === '2ak') confidence = 70;
    }
    if (lowerText.includes('emergency') || lowerText.includes('urgent')) {
      if (code.code === '1ae') confidence = 88;
    }
    
    if (confidence > 0) {
      suggestions.push({
        id: `service-${index}`,
        code: code.code,
        description: code.description,
        type: 'service',
        system: code.system,
        confidence,
      });
    }
  });

  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

export const validateCode = async (code: string): Promise<{ isValid: boolean; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allCodes = [...mockDiagnosisCodes, ...mockServiceCodes];
  const foundCode = allCodes.find(c => c.code.toLowerCase() === code.toLowerCase());
  
  if (foundCode) {
    return {
      isValid: true,
      message: `Valid ${foundCode.system} code: ${foundCode.description}`,
    };
  } else {
    return {
      isValid: false,
      message: 'Code not found in Norwegian medical code systems',
    };
  }
};
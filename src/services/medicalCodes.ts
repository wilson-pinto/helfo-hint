import { CodeSuggestion } from '../store/slices/medicalSlice';

// Mock data for Norwegian medical codes
export const mockDiagnosisCodes = [
  { code: 'A09', description: 'Gastroenteritis', system: 'ICD-10' as const },
  { code: 'J06', description: 'Acute upper respiratory infection', system: 'ICD-10' as const },
  { code: 'K59.1', description: 'Diarrhea', system: 'ICD-10' as const },
  { code: 'R50', description: 'Fever', system: 'ICD-10' as const },
  { code: 'D78', description: 'Digestive problem', system: 'ICPC-2' as const },
  { code: 'R74', description: 'Upper respiratory infection', system: 'ICPC-2' as const },
];

export const mockServiceCodes = [
  { code: '2ae', description: 'GP Consultation', system: 'HELFO' as const },
  { code: '1ae', description: 'Emergency visit', system: 'HELFO' as const },
  { code: '2ak', description: 'Extended consultation', system: 'HELFO' as const },
  { code: '1be', description: 'Home visit', system: 'Tjenestekoder' as const },
  { code: '2cd', description: 'Follow-up appointment', system: 'HELFO' as const },
  { code: '2dd', description: 'Comprehensive assessment', system: 'HELFO' as const }
];

// Default confidence levels for certain keywords in the note
const defaultServiceConfidence = {
  appointment: 65,
  consultation: 85,
  assessment: 75,
  examination: 80,
  emergency: 90,
  urgent: 90,
  visit: 70,
  checkup: 65
};

export const generateCodeSuggestions = async (soapNote: string): Promise<{
  diagnosisCodes: CodeSuggestion[];
  serviceCodes: CodeSuggestion[];
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const diagnosisSuggestions: CodeSuggestion[] = [];
  const serviceSuggestions: CodeSuggestion[] = [];
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
      diagnosisSuggestions.push({
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
    console.log(`Evaluating service code: ${code.code} - ${code.description}`, defaultServiceConfidence);
    
    // Use base confidence from keywords found in text
    Object.entries(defaultServiceConfidence).forEach(([keyword, baseConfidence]) => {
      if (lowerText.includes(keyword)) {
        // Set initial confidence based on keyword match
        confidence = Math.max(confidence, baseConfidence);
        
        // Adjust confidence based on specific code matches
        switch (code.code) {
          case '2ae': // GP Consultation
            if (keyword === 'consultation' || keyword === 'appointment') {
              confidence = Math.max(confidence, 95);
            }
            break;
          case '2ak': // Extended consultation
            if (keyword === 'assessment' || keyword === 'examination') {
              confidence = Math.max(confidence, 85);
            }
            break;
          case '1ae': // Emergency visit
            if (keyword === 'emergency' || keyword === 'urgent') {
              confidence = Math.max(confidence, 90);
            }
            break;
          case '1be': // Home visit
            if (keyword === 'visit' && lowerText.includes('home')) {
              confidence = Math.max(confidence, 88);
            }
            break;
          case '2cd': // Follow-up appointment
            if (lowerText.includes('follow') && lowerText.includes('up')) {
              confidence = Math.max(confidence, 85);
            }
            break;
          case '2dd': // Comprehensive assessment
            if (lowerText.includes('comprehensive') ||
                (lowerText.includes('full') && keyword === 'assessment')) {
              confidence = Math.max(confidence, 88);
            }
            break;
        }
      }
    });

    console.log('Service Suggestions:', serviceSuggestions);

    if (confidence > 0) {
      serviceSuggestions.push({
        id: `service-${index}`,
        code: code.code,
        description: code.description,
        type: 'service',
        system: code.system,
        confidence,
      });
    }
  });

  return {
    diagnosisCodes: diagnosisSuggestions.sort((a, b) => b.confidence - a.confidence),
    serviceCodes: serviceSuggestions.sort((a, b) => b.confidence - a.confidence)
  };
};

export const validateCode = async (code: string): Promise<{ isValid: boolean; message: string; code?: CodeSuggestion }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allCodes = [...mockDiagnosisCodes, ...mockServiceCodes];
  const foundCode = allCodes.find(c => c.code.toLowerCase() === code.toLowerCase());
  
  if (foundCode) {
    const codeType = mockServiceCodes.some(sc => sc.code === foundCode.code) ? 'service' : 'diagnosis';
    const validatedCode: CodeSuggestion = {
      id: `manual-${Date.now()}`,
      code: foundCode.code,
      description: foundCode.description,
      type: codeType,
      system: foundCode.system,
      confidence: 100,
    };
    
    return {
      isValid: true,
      message: `Valid ${foundCode.system} code: ${foundCode.description}`,
      code: validatedCode,
    };
  } else {
    return {
      isValid: false,
      message: 'Code not found in Norwegian medical code systems',
    };
  }
};
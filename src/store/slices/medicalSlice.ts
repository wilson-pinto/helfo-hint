import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface CodeSuggestion {
  id: string;
  code: string;
  description: string;
  type: 'diagnosis' | 'service';
  system: 'ICD-10' | 'ICPC-2' | 'HELFO' | 'Tjenestekoder';
  confidence: number;
  accepted?: boolean;
}

interface MedicalState {
  soapNote: SOAPNote;
  suggestedCodes: CodeSuggestion[];
  acceptedCodes: CodeSuggestion[];
  isLoading: boolean;
  manualCodeInput: string;
  manualCodes: CodeSuggestion[];
  manualCodeValidation: {
    isValid?: boolean;
    message?: string;
    code?: CodeSuggestion;
  } | null;
}

const initialState: MedicalState = {
  soapNote: {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  },
  suggestedCodes: [],
  acceptedCodes: [],
  isLoading: false,
  manualCodeInput: '',
  manualCodes: [],
  manualCodeValidation: null,
};

const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    updateSOAPField: (state, action: PayloadAction<{ field: keyof SOAPNote; value: string }>) => {
      state.soapNote[action.payload.field] = action.payload.value;
    },
    setSuggestedCodes: (state, action: PayloadAction<CodeSuggestion[]>) => {
      state.suggestedCodes = action.payload;
    },
    acceptCode: (state, action: PayloadAction<string>) => {
      const code = state.suggestedCodes.find(c => c.id === action.payload);
      if (code && !state.acceptedCodes.find(ac => ac.id === code.id)) {
        state.acceptedCodes.push({ ...code, accepted: true });
      }
    },
    rejectCode: (state, action: PayloadAction<string>) => {
      state.suggestedCodes = state.suggestedCodes.filter(c => c.id !== action.payload);
    },
    removeAcceptedCode: (state, action: PayloadAction<string>) => {
      state.acceptedCodes = state.acceptedCodes.filter(c => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setManualCodeInput: (state, action: PayloadAction<string>) => {
      state.manualCodeInput = action.payload;
    },
    setManualCodeValidation: (state, action: PayloadAction<{ isValid: boolean; message: string; code?: CodeSuggestion }>) => {
      state.manualCodeValidation = action.payload;
    },
    clearManualCodeValidation: (state) => {
      state.manualCodeValidation = null;
    },
    addManualCode: (state, action: PayloadAction<CodeSuggestion>) => {
      if (!state.manualCodes.find(c => c.id === action.payload.id)) {
        state.manualCodes.push(action.payload);
      }
    },
    removeManualCode: (state, action: PayloadAction<string>) => {
      state.manualCodes = state.manualCodes.filter(c => c.id !== action.payload);
    },
  },
});

export const {
  updateSOAPField,
  setSuggestedCodes,
  acceptCode,
  rejectCode,
  removeAcceptedCode,
  setLoading,
  setManualCodeInput,
  setManualCodeValidation,
  clearManualCodeValidation,
  addManualCode,
  removeManualCode,
} = medicalSlice.actions;

export default medicalSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SOAPNote {
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
  suggestedServiceCodes: CodeSuggestion[];
  acceptedCodes: CodeSuggestion[];
  isLoading: boolean;
  manualCodeInput: string;
  manualCodes: CodeSuggestion[];
  errors?: {
    diagnosis?: string;
    service?: string;
  };
  manualCodeValidation: {
    isValid?: boolean;
    message?: string;
    code?: CodeSuggestion;
  } | null;
  ui: {
    activeTab: 'diagnosis' | 'service';
    showHelp: boolean;
    tooltips: {
      [key: string]: boolean;
    };
    acceptedCodesFilter: 'all' | 'diagnosis' | 'service';
    acceptedCodesSort: 'newest' | 'oldest' | 'type' | 'system';
  };
}

const initialState: MedicalState = {
  soapNote: {
    subjective: 'Patient reports nausea and stomach pain for 2 days',
    objective: 'Temperature 37.8°C, abdominal tenderness',
    assessment: 'Probable gastroenteritis examination findings',
    plan: 'Oral rehydration, follow-up in 3 days',
    characterCount: {
      subjective: 0,
      objective: 0,
      assessment: 0,
      plan: 0
    }
  },
  suggestedCodes: [],
  suggestedServiceCodes: [],
  acceptedCodes: [],
  isLoading: false,
  manualCodeInput: '',
  manualCodes: [],
  errors: undefined,
  manualCodeValidation: null,
  ui: {
    activeTab: 'diagnosis',
    showHelp: false,
    tooltips: {},
    acceptedCodesFilter: 'all',
    acceptedCodesSort: 'newest'
  },
};

const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    updateSOAPCharCount: (state, action: PayloadAction<{ field: keyof SOAPNote; count: number }>) => {
      state.soapNote.characterCount[action.payload.field] = action.payload.count;
    },
    setSuggestedServiceCodes: (state, action: PayloadAction<CodeSuggestion[]>) => {
      state.suggestedServiceCodes = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'diagnosis' | 'service'>) => {
      state.ui.activeTab = action.payload;
    },
    toggleHelp: (state) => {
      state.ui.showHelp = !state.ui.showHelp;
    },
    setTooltipVisibility: (state, action: PayloadAction<{ id: string; visible: boolean }>) => {
      state.ui.tooltips[action.payload.id] = action.payload.visible;
    },
    setAcceptedCodesFilter: (state, action: PayloadAction<'all' | 'diagnosis' | 'service'>) => {
      state.ui.acceptedCodesFilter = action.payload;
    },
    setAcceptedCodesSort: (state, action: PayloadAction<'newest' | 'oldest' | 'type' | 'system'>) => {
      state.ui.acceptedCodesSort = action.payload;
    },
    updateSOAPField: (state, action: PayloadAction<{ field: 'subjective' | 'objective' | 'assessment' | 'plan'; value: string }>) => {
      const field = action.payload.field;
      state.soapNote[field] = action.payload.value;
    },
    setSuggestedCodes: (state, action: PayloadAction<CodeSuggestion[]>) => {
      state.suggestedCodes = action.payload;
    },
    setErrors: (state, action: PayloadAction<{ diagnosis?: string; service?: string } | undefined>) => {
      state.errors = action.payload;
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
  updateSOAPCharCount,
  setSuggestedCodes,
  setSuggestedServiceCodes,
  setErrors,
  setLoading,
  setManualCodeInput,
  setManualCodeValidation,
  clearManualCodeValidation,
  addManualCode,
  removeManualCode,
  setActiveTab,
  toggleHelp,
  setTooltipVisibility,
  setAcceptedCodesFilter,
  setAcceptedCodesSort,
} = medicalSlice.actions;

export default medicalSlice.reducer;
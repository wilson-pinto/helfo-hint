import { networkService } from '@/services/network';
import { ICodeSuggestion, IDiagnosisCodeSuggestion, ISOAPNote, TScreen } from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';


export const generateDiagnosisCodeSuggestions = createAsyncThunk(
  'suggestions/generate/diagnosis',
  async (soapString: string, { rejectWithValue }) => {
    try {
      const diagnosisCodes = await networkService.diagnoses.extract(soapString);
      return { diagnosisCodes };
    } catch (error) {
      return rejectWithValue('Failed to generate suggestions');
    }
  }
);

export const generateServiceCodeSuggestions = createAsyncThunk(
  'suggestions/generate/service',
  async (soapString: string, { rejectWithValue }) => {
    try {
      console.log({ soapString });

      const serviceCodes = await networkService.services.extract(soapString);
      console.log({ serviceCodes });
      return { serviceCodes };
    } catch (error) {
      return rejectWithValue('Failed to generate suggestions');
    }
  }
);

export const validateServiceCodes = createAsyncThunk(
  'validate/service',
  async ({ soapNote, inputCodes }: { soapNote: string, inputCodes: string[] }, { rejectWithValue }) => {
    try {
      const serviceCodes = await networkService.services.validate(soapNote, inputCodes);
      return { serviceCodes };
    } catch (error) {
      return rejectWithValue('Failed to generate suggestions');
    }
  }
);

interface MedicalState {
  soapString: string;
  currentScreen: TScreen;
  soapNote: ISOAPNote;
  suggestedDiagnosisCodes: IDiagnosisCodeSuggestion[];
  suggestedServiceCodes: ICodeSuggestion[];
  acceptedCodes: {
    diagnosis: ICodeSuggestion[];
    service: ICodeSuggestion[];
  };
  isLoading: {
    diagnosisSuggestions: boolean;
    serviceSuggestions: boolean;
    servicecodeValidation: boolean;
  };
  errors: {
    diagnosis?: string;
    service?: string;
    validation?: {
      diagnosis?: string;
      service?: string;
    };
  };
  manualCodeInput: string;
  validateServiceCodes: ICodeSuggestion[];
  manualCodeValidation: {
    isValid?: boolean;
    message?: string;
    code?: ICodeSuggestion;
  } | null;
  ui: {
    activeTab: 'diagnosis' | 'service';
    showHelp: boolean;
    tooltips: Record<string, boolean>;
    searchInput: {
      diagnosis: string;
      service: string;
    };
  };
}

const initialState: MedicalState = {
  soapString: '',
  currentScreen: 'guess-diagnosis-code',
  soapNote: {
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    characterCount: {
      subjective: 0,
      objective: 0,
      assessment: 0,
      plan: 0
    }
  },
  suggestedDiagnosisCodes: [],
  suggestedServiceCodes: [],
  acceptedCodes: {
    diagnosis: [],
    service: []
  },
  isLoading: {
    diagnosisSuggestions: false,
    serviceSuggestions: false,
    servicecodeValidation: false
  },
  errors: {},
  manualCodeInput: '',
  validateServiceCodes: [],
  manualCodeValidation: null,
  ui: {
    activeTab: 'diagnosis',
    showHelp: false,
    tooltips: {},
    searchInput: {
      diagnosis: '',
      service: ''
    }
  }
};

const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    setSoapString: (state, action: PayloadAction<string>) => {
      state.soapString = action.payload;
    },
    setScreen: (state, action: PayloadAction<TScreen>) => {
      state.currentScreen = action.payload;
    },
    updateSOAPField: (state, action: PayloadAction<{ field: keyof Pick<ISOAPNote, 'subjective' | 'objective' | 'assessment' | 'plan'>; value: string }>) => {
      const { field, value } = action.payload;
      state.soapNote[field] = value;
      state.soapNote.characterCount[field] = value.length;
    },
    setSuggestedDiagnosisCodes: (state, action: PayloadAction<IDiagnosisCodeSuggestion[]>) => {
      state.suggestedDiagnosisCodes = action.payload;
    },
    setSuggestedServiceCodes: (state, action: PayloadAction<ICodeSuggestion[]>) => {
      state.suggestedServiceCodes = action.payload;
    },
    acceptCode: (state, action: PayloadAction<ICodeSuggestion>) => {
      const code = action.payload;
      const targetArray = code.type === 'diagnosis'
        ? state.acceptedCodes.diagnosis
        : state.acceptedCodes.service;

      if (!targetArray.find(c => c.code === code.code)) {
        targetArray.push({ ...code, accepted: true });
      }
    },
    removeCode: (state, action: PayloadAction<{ code: string; type: 'diagnosis' | 'service' }>) => {
      const { code, type } = action.payload;
      state.acceptedCodes[type] = state.acceptedCodes[type].filter(c => c.code !== code);
    },
    setValidationStatus: (state, action: PayloadAction<{
      code: string;
      type: 'diagnosis' | 'service';
      status: {
        isValid: boolean;
        message: string;
        compatibleWithDiagnoses?: boolean;
      };
    }>) => {
      // const { code, type, status } = action.payload;
      // const targetArray = type === 'diagnosis'
      //   ? state.acceptedCodes.diagnosis
      //   : state.acceptedCodes.service;

      // const codeIndex = targetArray.findIndex(c => c.code === code);
      // if (codeIndex !== -1) {
      //   targetArray[codeIndex].validationStatus = status;
      // }
    },
    setLoading: (state, action: PayloadAction<{ type: keyof MedicalState['isLoading']; value: boolean }>) => {
      state.isLoading[action.payload.type] = action.payload.value;
    },
    setErrors: (state, action: PayloadAction<{
      diagnosis?: string;
      service?: string;
      validation?: {
        diagnosis?: string;
        service?: string;
      };
    }>) => {
      state.errors = action.payload;
    },
    setManualCodeInput: (state, action: PayloadAction<string>) => {
      state.manualCodeInput = action.payload;
    },
    setManualCodeValidation: (state, action: PayloadAction<{
      isValid: boolean;
      message: string;
      code?: ICodeSuggestion;
    } | null>) => {
      state.manualCodeValidation = action.payload;
    },
    clearManualCodeValidation: (state) => {
      state.manualCodeValidation = null;
    },
    addManualCode: (state, action: PayloadAction<string>) => {
      console.log(action.payload)
      // if (!state.validateServiceCodes.find(c => c === action.payload as string)) {
      //   state.validateServiceCodes.push(action.payload as string);
      // }
    },
    removeManualCode: (state, action: PayloadAction<string>) => {
      state.validateServiceCodes = state.validateServiceCodes.filter(c => c.id !== action.payload);
    },
    setActiveTab: (state, action: PayloadAction<'diagnosis' | 'service'>) => {
      state.ui.activeTab = action.payload;
    },
    setSearchInput: (state, action: PayloadAction<{ type: 'diagnosis' | 'service'; value: string }>) => {
      state.ui.searchInput[action.payload.type] = action.payload.value;
    },
    toggleHelp: (state) => {
      state.ui.showHelp = !state.ui.showHelp;
    },
    setTooltipVisibility: (state, action: PayloadAction<{ id: string; visible: boolean }>) => {
      state.ui.tooltips[action.payload.id] = action.payload.visible;
    },
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    builder.addCase(generateDiagnosisCodeSuggestions.pending, (state) => {
      state.isLoading.diagnosisSuggestions = true;
      state.errors = {};
    });
    builder.addCase(generateDiagnosisCodeSuggestions.fulfilled, (state, action) => {
      state.isLoading.diagnosisSuggestions = false;
      state.suggestedDiagnosisCodes = action.payload.diagnosisCodes as unknown as IDiagnosisCodeSuggestion[];
    });
    builder.addCase(generateDiagnosisCodeSuggestions.rejected, (state, action) => {
      state.isLoading.diagnosisSuggestions = false;
      state.errors.diagnosis = action.payload as string;
    });
    builder.addCase(generateServiceCodeSuggestions.pending, (state) => {
      state.isLoading.serviceSuggestions = true;
      state.errors = {};
    });
    builder.addCase(generateServiceCodeSuggestions.fulfilled, (state, action) => {
      state.isLoading.serviceSuggestions = false;
      state.suggestedServiceCodes = action.payload.serviceCodes as unknown as ICodeSuggestion[];
    });
    builder.addCase(generateServiceCodeSuggestions.rejected, (state, action) => {
      state.isLoading.serviceSuggestions = false;
      state.errors.service = action.payload as string;
    });
    builder.addCase(validateServiceCodes.pending, (state) => {
      state.acceptedCodes.service = []
      state.isLoading.servicecodeValidation = true;
      state.errors = {};
    });
    builder.addCase(validateServiceCodes.fulfilled, (state, action) => {
      state.isLoading.servicecodeValidation = false;
      state.acceptedCodes.service = action.payload.serviceCodes;
    });
    builder.addCase(validateServiceCodes.rejected, (state, action) => {
      state.isLoading.servicecodeValidation = false;
      // state.errors.validation = action.payload as string;
    });
  }
});

export const {
  setScreen,
  updateSOAPField,
  setSuggestedDiagnosisCodes,
  setSuggestedServiceCodes,
  acceptCode,
  removeCode,
  setValidationStatus,
  setLoading,
  setErrors,
  setActiveTab,
  setSearchInput,
  toggleHelp,
  setTooltipVisibility,
  setManualCodeInput,
  setManualCodeValidation,
  clearManualCodeValidation,
  addManualCode,
  removeManualCode,
  resetState,
  setSoapString
} = medicalSlice.actions;

export default medicalSlice.reducer;
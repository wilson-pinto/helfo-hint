import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeValidation } from '@/pages/CodeValidation';
import { renderWithProviders } from '@/test-utils';
import { networkService } from '@/services/network';
import { configureStore } from '@reduxjs/toolkit';
import medicalReducer, { CodeSuggestion } from '@/store/slices/medicalSlice';

// Mock the network service
jest.mock('@/services/network', () => ({
  networkService: {
    diagnoses: {
      validate: jest.fn(),
    },
    services: {
      validate: jest.fn(),
    },
  },
}));

const mockDiagnosis: CodeSuggestion = {
  id: 'diag-1',
  code: 'K30',
  description: 'Dyspepsia',
  type: 'diagnosis',
  system: 'ICD-10',
  confidence: 85,
  accepted: true,
};

const mockService: CodeSuggestion = {
  id: 'service-1',
  code: '2CD',
  description: 'Consultation',
  type: 'service',
  system: 'HELFO',
  confidence: 90,
  accepted: true,
};

const mockInitialState = {
  medical: {
    currentScreen: 'code-validation' as const,
    soapNote: {
      subjective: 'Test note',
      objective: 'Test findings',
      assessment: 'Test assessment',
      plan: 'Test plan',
      characterCount: {
        subjective: 9,
        objective: 13,
        assessment: 15,
        plan: 9,
      },
    },
    acceptedCodes: {
      diagnosis: [mockDiagnosis],
      service: [mockService],
    },
    isLoading: {
      suggestions: false,
      validation: false,
    },
    errors: {},
    ui: {
      activeTab: 'diagnosis' as const,
      showHelp: false,
      tooltips: {},
      searchInput: {
        diagnosis: '',
        service: '',
      },
    },
  },
};

describe('CodeValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays accepted codes in side-by-side panels', () => {
    renderWithProviders(<CodeValidation />, {
      preloadedState: mockInitialState,
    });

    expect(screen.getByText('K30')).toBeInTheDocument();
    expect(screen.getByText('Dyspepsia')).toBeInTheDocument();
    expect(screen.getByText('2CD')).toBeInTheDocument();
    expect(screen.getByText('Consultation')).toBeInTheDocument();
  });

  it('validates codes when clicking validate button', async () => {
    (networkService.diagnoses.validate as jest.Mock).mockResolvedValue({
      data: {
        status: 1,
        data: {
          code: {
            code: 'K30',
            description: 'Dyspepsia',
            system: 'ICD-10',
          },
          isValid: true,
        },
      },
    });

    (networkService.services.validate as jest.Mock).mockResolvedValue({
      data: {
        status: 1,
        data: {
          isValid: true,
          compatibleWithDiagnoses: true,
          message: 'Valid service code',
        },
      },
    });

    renderWithProviders(<CodeValidation />, {
      preloadedState: mockInitialState,
    });

    const validateButton = screen.getByRole('button', { name: /validate all codes/i });
    await userEvent.click(validateButton);

    // Check loading state
    expect(screen.getByText(/validating/i)).toBeInTheDocument();

    // Wait for validation results
    await waitFor(() => {
      expect(screen.getByText(/valid icd-10 code/i)).toBeInTheDocument();
      expect(screen.getByText(/valid service code/i)).toBeInTheDocument();
    });
  });

  it('handles validation errors properly', async () => {
    (networkService.diagnoses.validate as jest.Mock).mockRejectedValue(
      new Error('Validation failed')
    );

    renderWithProviders(<CodeValidation />, {
      preloadedState: mockInitialState,
    });

    const validateButton = screen.getByRole('button', { name: /validate all codes/i });
    await userEvent.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
    });
  });

  it('allows adding new codes through manual entry', async () => {
    renderWithProviders(<CodeValidation />, {
      preloadedState: mockInitialState,
    });

    const diagnosisInput = screen.getByPlaceholderText(/search diagnosis codes/i);
    await userEvent.type(diagnosisInput, 'K30');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getAllByText('K30')).toHaveLength(2);
    });
  });

  it('disables validate button when no codes are present', () => {
    const emptyState = {
      ...mockInitialState,
      medical: {
        ...mockInitialState.medical,
        acceptedCodes: {
          diagnosis: [],
          service: [],
        },
      },
    };

    renderWithProviders(<CodeValidation />, {
      preloadedState: emptyState,
    });

    const validateButton = screen.getByRole('button', { name: /validate all codes/i });
    expect(validateButton).toBeDisabled();
  });
});
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeGuessing } from '@/pages/CodeGuessing';
import { renderWithProviders } from '@/test-utils';
import { networkService } from '@/services/network';

// Mock the network service
jest.mock('@/services/network', () => ({
  networkService: {
    diagnoses: {
      extract: jest.fn(),
    },
    services: {
      extract: jest.fn(),
    },
  },
}));

const mockDiagnosisCodes = [
  {
    id: 'diag-1',
    code: 'K30',
    description: 'Dyspepsia',
    type: 'diagnosis' as const,
    system: 'ICD-10' as const,
    confidence: 85,
  },
];

const mockServiceCodes = [
  {
    id: 'service-1',
    code: '2CD',
    description: 'Consultation',
    type: 'service' as const,
    system: 'HELFO' as const,
    confidence: 90,
  },
];

describe('CodeGuessing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (networkService.diagnoses.extract as jest.Mock).mockResolvedValue({
      data: {
        status: 1,
        data: mockDiagnosisCodes,
        message: 'Success',
      },
    });
    (networkService.services.extract as jest.Mock).mockResolvedValue({
      data: {
        status: 1,
        data: mockServiceCodes,
        message: 'Success',
      },
    });
  });

  it('renders both tabs and switches between them', async () => {
    renderWithProviders(<CodeGuessing />);
    
    const diagnosisTab = screen.getByRole('tab', { name: /diagnosis codes/i });
    const serviceTab = screen.getByRole('tab', { name: /service codes/i });
    
    expect(diagnosisTab).toHaveAttribute('aria-selected', 'true');
    expect(serviceTab).toHaveAttribute('aria-selected', 'false');
    
    await userEvent.click(serviceTab);
    
    expect(diagnosisTab).toHaveAttribute('aria-selected', 'false');
    expect(serviceTab).toHaveAttribute('aria-selected', 'true');
  });

  it('generates and displays code suggestions', async () => {
    renderWithProviders(<CodeGuessing />);

    // Add text to SOAP note
    const subjectiveField = screen.getByLabelText(/subjective/i);
    await userEvent.type(subjectiveField, 'Patient reports stomach pain');
    
    // Click generate button
    const generateButton = screen.getByRole('button', { name: /generate code suggestions/i });
    await userEvent.click(generateButton);
    
    // Check loading state
    expect(screen.getByText(/analyzing soap note/i)).toBeInTheDocument();
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('K30')).toBeInTheDocument();
      expect(screen.getByText('Dyspepsia')).toBeInTheDocument();
    });
    
    // Switch to service tab
    const serviceTab = screen.getByRole('tab', { name: /service codes/i });
    await userEvent.click(serviceTab);
    
    // Check service codes
    expect(screen.getByText('2CD')).toBeInTheDocument();
    expect(screen.getByText('Consultation')).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    // Mock API error
    (networkService.diagnoses.extract as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    renderWithProviders(<CodeGuessing />);
    
    // Add text and trigger API call
    const subjectiveField = screen.getByLabelText(/subjective/i);
    await userEvent.type(subjectiveField, 'Test input');
    
    const generateButton = screen.getByRole('button', { name: /generate code suggestions/i });
    await userEvent.click(generateButton);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('accepts code suggestions', async () => {
    renderWithProviders(<CodeGuessing />);
    
    // Add text and generate codes
    const subjectiveField = screen.getByLabelText(/subjective/i);
    await userEvent.type(subjectiveField, 'Patient reports symptoms');
    
    const generateButton = screen.getByRole('button', { name: /generate code suggestions/i });
    await userEvent.click(generateButton);
    
    // Wait for suggestions and accept a code
    await waitFor(() => {
      const acceptButton = screen.getByRole('button', { name: /accept/i });
      userEvent.click(acceptButton);
    });
    
    // Verify code is marked as accepted
    await waitFor(() => {
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });
  });
});
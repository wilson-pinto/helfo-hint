import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SOAPInput } from '@/components/SOAPInput';
import { Provider } from 'react-redux';
import { store } from '@/store';
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

const renderWithRedux = (component: React.ReactNode) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('SOAPInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all SOAP fields', () => {
    renderWithRedux(<SOAPInput />);
    
    expect(screen.getByLabelText(/subjective/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/objective/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assessment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plan/i)).toBeInTheDocument();
  });

  it('updates character count when typing', () => {
    renderWithRedux(<SOAPInput />);
    
    const subjectiveField = screen.getByLabelText(/subjective/i);
    fireEvent.change(subjectiveField, { target: { value: 'Test input' } });
    
    expect(screen.getByText('10 / 2000')).toBeInTheDocument();
  });

  it('disables generate button when fields are empty', () => {
    renderWithRedux(<SOAPInput />);
    
    const generateButton = screen.getByRole('button', { name: /generate code suggestions/i });
    expect(generateButton).toBeDisabled();
  });

  it('shows loading state during API calls', async () => {
    // Mock API responses
    (networkService.diagnoses.extract as jest.Mock).mockResolvedValue({
      data: {
        status: 1,
        data: [],
        message: 'Success'
      }
    });
    
    (networkService.services.extract as jest.Mock).mockResolvedValue({
      data: {
        status: 1,
        data: [],
        message: 'Success'
      }
    });

    renderWithRedux(<SOAPInput />);
    
    // Add some text to enable the button
    const subjectiveField = screen.getByLabelText(/subjective/i);
    fireEvent.change(subjectiveField, { target: { value: 'Patient reports symptoms' } });
    
    const generateButton = screen.getByRole('button', { name: /generate code suggestions/i });
    fireEvent.click(generateButton);
    
    expect(await screen.findByText(/analyzing soap note/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/generate code suggestions/i)).toBeInTheDocument();
    });
  });

  it('shows error when API call fails', async () => {
    // Mock API failure
    (networkService.diagnoses.extract as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    renderWithRedux(<SOAPInput />);
    
    const subjectiveField = screen.getByLabelText(/subjective/i);
    fireEvent.change(subjectiveField, { target: { value: 'Patient reports symptoms' } });
    
    const generateButton = screen.getByRole('button', { name: /generate code suggestions/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(store.getState().medical.errors.diagnosis).toBe('API Error');
    });
  });

  it('enforces character limit', () => {
    renderWithRedux(<SOAPInput />);
    
    const subjectiveField = screen.getByLabelText(/subjective/i);
    const longText = 'a'.repeat(2001);
    
    fireEvent.change(subjectiveField, { target: { value: longText } });
    
    expect(subjectiveField).toHaveValue('a'.repeat(2000));
  });
});
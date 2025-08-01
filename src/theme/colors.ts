// Utility object for common opacity values and class patterns
export const medicalUtils = {
  opacity: {
    light: '0.1',
    medium: '0.2',
    strong: '0.5'
  }
};

// Common Tailwind class patterns
export const medicalClasses = {
  button: {
    primary: 'bg-medical-primary hover:bg-medical-primary-hover text-white shadow-sm transition-colors duration-200',
    secondary: 'bg-medical-secondary hover:bg-medical-secondary-hover text-white shadow-sm transition-colors duration-200',
    success: 'bg-medical-success hover:bg-medical-success-hover text-medical-foreground shadow-sm transition-colors duration-200',
    error: 'bg-medical-error hover:bg-medical-error-hover text-white shadow-sm transition-colors duration-200'
  },
  input: 'bg-medical-neutral focus:bg-white border-0 focus:ring-2 focus:ring-medical-primary transition-all duration-200',
  card: 'bg-medical-surface shadow-sm',
  validation: {
    success: 'bg-medical-success text-medical-foreground',
    error: 'bg-medical-error text-white'
  }
};
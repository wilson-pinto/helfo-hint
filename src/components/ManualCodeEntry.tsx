import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setManualCodeInput, setManualCodeValidation, clearManualCodeValidation } from '../store/slices/medicalSlice';
import { validateCode } from '../services/medicalCodes';
import { useState } from 'react';

export const ManualCodeEntry = () => {
  const dispatch = useAppDispatch();
  const { manualCodeInput, manualCodeValidation } = useAppSelector((state) => state.medical);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!manualCodeInput.trim()) return;
    
    setIsValidating(true);
    try {
      const result = await validateCode(manualCodeInput.trim());
      dispatch(setManualCodeValidation(result));
    } catch (error) {
      console.error('Error validating code:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    dispatch(setManualCodeInput(value));
    if (manualCodeValidation) {
      dispatch(clearManualCodeValidation());
    }
  };

  const getValidationIcon = () => {
    if (!manualCodeValidation) return null;
    
    if (manualCodeValidation.isValid) {
      return <CheckCircle className="h-5 w-5 text-medical-success" />;
    } else {
      return <XCircle className="h-5 w-5 text-medical-error" />;
    }
  };

  const getValidationColor = () => {
    if (!manualCodeValidation) return '';
    return manualCodeValidation.isValid ? 'text-medical-success' : 'text-medical-error';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Try Your Own Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manual-code">Enter your own ICD/ICPC/Service code</Label>
          <div className="flex gap-2">
            <Input
              id="manual-code"
              placeholder="e.g., A09, J06, 2ae..."
              value={manualCodeInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleValidate}
              disabled={!manualCodeInput.trim() || isValidating}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>
        </div>
        
        {manualCodeValidation && (
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${
            manualCodeValidation.isValid 
              ? 'bg-medical-success/10 border-medical-success/20' 
              : 'bg-medical-error/10 border-medical-error/20'
          }`}>
            {getValidationIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium ${getValidationColor()}`}>
                  {manualCodeValidation.isValid ? 'Valid Code' : 'Invalid Code'}
                </span>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className={`text-sm ${getValidationColor()}`}>
                {manualCodeValidation.message}
              </p>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>Supported formats: ICD-10 (e.g., A09, J06), ICPC-2 (e.g., D78, R74), HELFO/Service codes (e.g., 2ae, 1ae)</p>
        </div>
      </CardContent>
    </Card>
  );
};
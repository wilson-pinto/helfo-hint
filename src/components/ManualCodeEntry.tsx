import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Info, Plus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setManualCodeInput, setManualCodeValidation, clearManualCodeValidation, addManualCode, removeManualCode } from '../store/slices/medicalSlice';
import { validateCode } from '../services/medicalCodes';
import { useState } from 'react';

export const ManualCodeEntry = () => {
  const dispatch = useAppDispatch();
  const { manualCodeInput, manualCodeValidation, manualCodes } = useAppSelector((state) => state.medical);
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

  const handleAddCode = () => {
    if (manualCodeValidation?.isValid && manualCodeValidation.code) {
      dispatch(addManualCode(manualCodeValidation.code));
      dispatch(setManualCodeInput(''));
      dispatch(clearManualCodeValidation());
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
    <Card className="mb-6 border-medical-accent/20">
      <CardHeader className="bg-gradient-to-r from-medical-accent/5 to-medical-warning/5 border-b border-medical-accent/10">
        <CardTitle className="flex items-center gap-2 text-medical-accent">
          <Search className="h-5 w-5" />
          Manual Code Entry
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Add multiple codes manually by searching and validating
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          <Label htmlFor="manual-code" className="text-base font-medium">Enter medical code</Label>
          <div className="flex gap-2">
            <Input
              id="manual-code"
              placeholder="e.g., A09, J06, 2ae..."
              value={manualCodeInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="flex-1 border-medical-accent/20 focus:border-medical-accent/40"
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
            <Button
              onClick={handleValidate}
              disabled={!manualCodeInput.trim() || isValidating}
              variant="outline"
              className="border-medical-accent/30 hover:bg-medical-accent/10"
            >
              <Search className="h-4 w-4 mr-2" />
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>
        </div>
        
        {manualCodeValidation && (
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            manualCodeValidation.isValid 
              ? 'bg-medical-success/10 border-medical-success/20' 
              : 'bg-medical-error/10 border-medical-error/20'
          }`}>
            {getValidationIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${getValidationColor()}`}>
                    {manualCodeValidation.isValid ? 'Valid Code Found' : 'Invalid Code'}
                  </span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                {manualCodeValidation.isValid && (
                  <Button
                    onClick={handleAddCode}
                    size="sm"
                    className="bg-medical-success hover:bg-medical-success/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Code
                  </Button>
                )}
              </div>
              <p className={`text-sm ${getValidationColor()}`}>
                {manualCodeValidation.message}
              </p>
            </div>
          </div>
        )}

        {manualCodes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Added Codes ({manualCodes.length})</Label>
            <div className="grid gap-2">
              {manualCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {code.code}
                    </Badge>
                    <div>
                      <p className="font-medium">{code.description}</p>
                      <p className="text-sm text-muted-foreground">{code.system} • {code.type}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch(removeManualCode(code.id))}
                    className="text-medical-error hover:text-medical-error hover:bg-medical-error/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p><strong>Supported formats:</strong> ICD-10 (A09, J06), ICPC-2 (D78, R74), HELFO/Service codes (2ae, 1ae)</p>
          <p className="mt-1">Press Enter to validate or click the Validate button</p>
        </div>
      </CardContent>
    </Card>
  );
};
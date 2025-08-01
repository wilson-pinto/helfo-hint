import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, CheckCircle, XCircle, Info, Plus, X, Stethoscope, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setManualCodeInput, setManualCodeValidation, clearManualCodeValidation, addManualCode, removeManualCode } from '../store/slices/medicalSlice';
import { validateCode, mockDiagnosisCodes, mockServiceCodes } from '../services/medicalCodes';
import { useState, useEffect, KeyboardEvent } from 'react';

export const ManualCodeEntry = () => {
  const dispatch = useAppDispatch();
  const { manualCodeInput, manualCodeValidation, manualCodes } = useAppSelector((state) => state.medical);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'diagnosis' | 'service'>('diagnosis');
  const [selectedSystem, setSelectedSystem] = useState<'ICD-10' | 'ICPC-2' | 'HELFO' | 'Tjenestekoder'>('ICD-10');
  const [pendingCodes, setPendingCodes] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{code: string, description: string}>>([]);

  // Update selectedSystem when tab changes
  useEffect(() => {
    setSelectedSystem(selectedTab === 'diagnosis' ? 'ICD-10' : 'HELFO');
    dispatch(setManualCodeInput(''));
    dispatch(clearManualCodeValidation());
    setPendingCodes([]);
  }, [selectedTab, dispatch]);

  // Get suggestions based on selected system and tab
  useEffect(() => {
    const relevantCodes = selectedTab === 'diagnosis'
      ? mockDiagnosisCodes.filter(code => code.system === selectedSystem)
      : mockServiceCodes.filter(code => code.system === selectedSystem);
    setSuggestions(relevantCodes.map(code => ({
      code: code.code,
      description: code.description
    })));
  }, [selectedSystem, selectedTab]);

  const addCodeToPending = (code: string) => {
    if (!pendingCodes.includes(code)) {
      setPendingCodes([...pendingCodes, code]);
      dispatch(setManualCodeInput(''));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manualCodeInput.trim()) {
      addCodeToPending(manualCodeInput.trim());
    }
  };

  const handleValidate = async () => {
    if (pendingCodes.length === 0) return;
    
    setIsValidating(true);
    try {
      const validationResults = await Promise.all(
        pendingCodes.map(code => validateCode(code))
      );
      
      const validCodes = validationResults.filter(result => result.isValid && result.code);
      validCodes.forEach(result => {
        if (result.code) dispatch(addManualCode(result.code));
      });

      const invalidCodes = pendingCodes.filter((_, index) => !validationResults[index].isValid);
      
      if (invalidCodes.length > 0) {
        dispatch(setManualCodeValidation({
          isValid: false,
          message: `Invalid codes found: ${invalidCodes.join(', ')}`
        }));
      } else {
        dispatch(clearManualCodeValidation());
        setPendingCodes([]);
      }
    } catch (error) {
      console.error('Error validating codes:', error);
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

  const handleSuggestionClick = (code: string) => {
    addCodeToPending(code);
  };

  const handleRemovePendingCode = (index: number) => {
    const newCodes = pendingCodes.filter((_, i) => i !== index);
    setPendingCodes(newCodes);
  };

  const getValidationIcon = () => {
    if (!manualCodeValidation) return null;
    return manualCodeValidation.isValid 
      ? <CheckCircle className="h-5 w-5 text-medical-success" />
      : <XCircle className="h-5 w-5 text-medical-error" />;
  };

  const getValidationColor = () => {
    if (!manualCodeValidation) return '';
    return manualCodeValidation.isValid ? 'text-medical-success' : 'text-medical-error';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 border-medical-accent/20">
        <CardHeader className="bg-gradient-to-r from-medical-accent/5 to-medical-warning/5 border-b border-medical-accent/10">
          <CardTitle className="flex items-center gap-2 text-medical-accent">
            <Search className="h-5 w-5" />
            Manual Code Entry
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add multiple codes manually (separate by commas)
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="diagnosis" value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'diagnosis' | 'service')}>
            <TabsList className="w-full">
              <TabsTrigger value="diagnosis" className="w-full">
                <Stethoscope className="h-4 w-4 mr-2" />
                Diagnosis Codes
              </TabsTrigger>
              <TabsTrigger value="service" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Service Codes
              </TabsTrigger>
            </TabsList>

            {['diagnosis', 'service'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`manual-code-${tab}`} className="text-base font-medium">
                      Enter {tab} code
                    </Label>
                    <Select value={selectedSystem} onValueChange={(v: any) => setSelectedSystem(v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        {tab === 'diagnosis' ? (
                          <>
                            <SelectItem value="ICD-10">ICD-10</SelectItem>
                            <SelectItem value="ICPC-2">ICPC-2</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="HELFO">HELFO</SelectItem>
                            <SelectItem value="Tjenestekoder">Tjenestekoder</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id={`manual-code-${tab}`}
                          placeholder={tab === 'diagnosis' 
                            ? (selectedSystem === 'ICD-10' ? "e.g., A09, J06, K59.1" : "e.g., D73, L70, R74")
                            : "e.g., 2ae, 1ae, 2ak"
                          }
                          value={manualCodeInput}
                          onChange={(e) => handleInputChange(e.target.value)}
                          className="w-full border-medical-accent/20 focus:border-medical-accent/40"
                          onKeyDown={handleKeyDown}
                        />
                        <AnimatePresence>
                          {manualCodeInput && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 w-full max-h-40 overflow-y-auto bg-card border rounded-md mt-1 z-10 shadow-md"
                            >
                              {suggestions
                                .filter(s => s.code.toLowerCase().includes(manualCodeInput.toLowerCase()))
                                .map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                                    onClick={() => handleSuggestionClick(suggestion.code)}
                                  >
                                    <span className="font-mono">{suggestion.code}</span>
                                    <span className="text-sm text-gray-600">{suggestion.description}</span>
                                  </div>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Button
                        onClick={handleValidate}
                        disabled={pendingCodes.length === 0 || isValidating}
                        variant="outline"
                        className="border-medical-accent/30 hover:bg-medical-accent/10"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {isValidating ? 'Validating...' : 'Validate'}
                      </Button>
                    </div>
                    {pendingCodes.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30">
                        {pendingCodes.map((code, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className={`font-mono ${
                              manualCodeValidation?.isValid && manualCodeValidation.code?.code === code
                                ? 'border-medical-success text-medical-success'
                                : ''
                            }`}
                          >
                            {code}
                            <button 
                              onClick={() => handleRemovePendingCode(index)}
                              className="ml-1 hover:text-medical-error"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <AnimatePresence mode="wait">
            {manualCodeValidation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 p-4 rounded-lg border mt-4 ${
                  manualCodeValidation.isValid
                    ? 'bg-medical-success/10 border-medical-success/20'
                    : 'bg-medical-error/10 border-medical-error/20'
                }`}
              >
                {getValidationIcon()}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getValidationColor()}`}>
                        {manualCodeValidation.isValid ? 'Valid Codes Found' : 'Invalid Codes Found'}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">
                              {manualCodeValidation.isValid
                                ? `Valid ${selectedSystem} code found in the system`
                                : `Please check the code format for ${selectedSystem}`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <p className={`text-sm ${getValidationColor()}`}>
                    {manualCodeValidation.message}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {manualCodes.length > 0 && (
            <div className="space-y-3 mt-6">
              <Label className="text-base font-medium">Added Codes ({manualCodes.length})</Label>
              <div className="grid gap-2">
                <AnimatePresence mode="popLayout">
                  {manualCodes.map((code) => (
                    <motion.div
                      key={code.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                    >
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t mt-6 pt-3">
            <p><strong>Supported formats:</strong> ICD-10 (A09, J06), ICPC-2 (D78, R74), HELFO/Service codes (2ae, 1ae)</p>
            <p className="mt-1">Enter multiple codes separated by commas</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
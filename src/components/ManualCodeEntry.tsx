import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, CheckCircle, XCircle, Info, Plus, X, Stethoscope, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
      
      // Clear selections after validation
      setPendingCodes([]);
      dispatch(setManualCodeInput(''));
      
      if (invalidCodes.length > 0) {
        dispatch(setManualCodeValidation({
          isValid: false,
          message: `Invalid codes found: ${invalidCodes.join(', ')}`
        }));
      } else {
        dispatch(setManualCodeValidation({
          isValid: true,
          message: `Successfully validated ${validCodes.length} code${validCodes.length !== 1 ? 's' : ''}`
        }));
      }
    } catch (error) {
      console.error('Error validating codes:', error);
      dispatch(setManualCodeValidation({
        isValid: false,
        message: 'An error occurred while validating codes'
      }));
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
    if (!pendingCodes.includes(code)) {
      setPendingCodes([...pendingCodes, code]);
      dispatch(setManualCodeInput(''));
    }
  };

  const handleRemovePendingCode = (index: number) => {
    const newCodes = pendingCodes.filter((_, i) => i !== index);
    setPendingCodes(newCodes);
    if (manualCodeValidation) {
      dispatch(clearManualCodeValidation());
    }
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
      <Card className="mb-6 bg-medical-surface">
      <CardHeader className="bg-medical-primary/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-medical-primary">
            <Search className="h-5 w-5" />
            Validate Code
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select codes and validate
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
                            {/* <SelectItem  value="Tjenestekoder">Tjenestekoder</SelectItem> */}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-4">
                      <div className="rounded-lg border">
                        <Command className="rounded-lg">
                          <CommandInput
                            placeholder={tab === 'diagnosis'
                              ? (selectedSystem === 'ICD-10' ? "Search ICD-10 codes..." : "Search ICPC-2 codes...")
                              : "Search service codes..."
                            }
                            value={manualCodeInput}
                            onValueChange={handleInputChange}
                          />
                          <CommandList>
                            <CommandEmpty>No codes found.</CommandEmpty>
                            <CommandGroup>
                              {suggestions
                                .filter(s =>
                                  !pendingCodes.includes(s.code) && (
                                    s.code.toLowerCase().includes(manualCodeInput.toLowerCase()) ||
                                    s.description.toLowerCase().includes(manualCodeInput.toLowerCase())
                                  )
                                )
                                .map((suggestion, index) => (
                                  <CommandItem
                                    key={index}
                                    onSelect={() => handleSuggestionClick(suggestion.code)}
                                    className="flex justify-between"
                                  >
                                    <Badge variant="outline" className="font-mono">
                                      {suggestion.code}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground truncate ml-2">
                                      {suggestion.description}
                                    </span>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>

                      <AnimatePresence>
                        {pendingCodes.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-medical-neutral/50">
                              {pendingCodes.map((code, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="font-mono bg-white"
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
                            <Button
                              onClick={handleValidate}
                              disabled={isValidating}
                              className="w-full bg-medical-primary hover:bg-medical-primary-hover text-white"
                            >
                              <Search className="h-4 w-4 mr-2" />
                              {isValidating ? 'Validating...' : `Validate ${pendingCodes.length} Selected Code${pendingCodes.length !== 1 ? 's' : ''}`}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                className={`p-4 rounded-lg mt-4 ${
                  manualCodeValidation.isValid
                    ? 'bg-medical-success/10 border border-medical-success/20'
                    : 'bg-medical-error/10 border border-medical-error/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getValidationIcon()}
                  <span className={`font-medium ${getValidationColor()}`}>
                    {manualCodeValidation.isValid ? 'Validation Successful' : 'Validation Failed'}
                  </span>
                </div>
                <p className={`text-sm ${getValidationColor()}`}>
                  {manualCodeValidation.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {manualCodes.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Validated Codes</Label>
                <Badge variant="outline" className="bg-medical-success/10 text-medical-success border-medical-success">
                  {manualCodes.length} code{manualCodes.length !== 1 ? 's' : ''} added
                </Badge>
              </div>
              <div className="grid gap-2">
                <AnimatePresence mode="popLayout">
                  {manualCodes.map((code) => (
                    <motion.div
                      key={code.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-medical-neutral/50 transition-colors bg-medical-surface border border-border/50"
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
                        className="bg-medical-surface hover:bg-medical-error hover:text-white text-medical-error"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div className="text-xs mt-6 pt-3 text-medical-primary">
            <p><strong>Supported formats:</strong> ICD-10 (A09, J06), ICPC-2 (D78, R74), HELFO/Service codes (2ae, 1ae)</p>
            <p className="mt-1">Enter multiple codes separated by commas</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
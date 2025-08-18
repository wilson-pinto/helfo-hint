import { SOAPInput } from '@/components/SOAPInput';
import { ManualCodeEntry } from '@/components/ManualCodeEntry';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setLoading, setValidationStatus } from '@/store/slices/medicalSlice';
import { networkService } from '@/services/network';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export const CodeValidation = () => {
  const dispatch = useAppDispatch();
  const { acceptedCodes, isLoading } = useAppSelector((state) => state.medical);

  const handleValidateDiagnosisCodes = async () => {
    dispatch(setLoading({ type: 'servicecodeValidation', value: true }));

    try {
      for (const code of acceptedCodes.diagnosis) {
        const result = await networkService.diagnoses.validate(code.code);
        if (result.data.status === 1 && result.data.data.code) {
          dispatch(setValidationStatus({
            code: code.code,
            type: 'diagnosis',
            status: {
              isValid: true,
              message: `Valid ${result.data.data.code.system} code: ${result.data.data.code.description}`,
            }
          }));
        } else {
          dispatch(setValidationStatus({
            code: code.code,
            type: 'diagnosis',
            status: {
              isValid: false,
              message: result.data.message || 'Invalid code',
            }
          }));
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      dispatch(setLoading({ type: 'servicecodeValidation', value: false }));
    }
  };

  const getValidationStatusColor = (compliance) =>{
    if(compliance === "pass"){
         return "border-green-500 text-green-700 bg-green-50"
    }

    if(compliance === "fail"){
         return "border-red-500 text-red-700 bg-red-50"
    }

    if(compliance === "warn"){
         return "border-yellow-500 text-yellow-700 bg-yellow-50"
    }
  }

  const renderValidationStatus = (code: typeof acceptedCodes.diagnosis[0] | typeof acceptedCodes.service[0]) => {
    if (!code.validationStatus) return null;

    return (
      <Alert 
        className={cn(
          "mt-2",
          getValidationStatusColor(code.validationStatus.compliance)
        )}
      >
        {code.validationStatus.compliance === "pass" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertDescription>{code.validationStatus.message}</AlertDescription>
        {/* {code.validationStatus.compatibleWithDiagnoses === false && (
          <AlertDescription className="mt-1 text-amber-600">
            This service code may not be compatible with the selected diagnoses.
          </AlertDescription>
        )} */}
      </Alert>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <SOAPInput hideGenerateButton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diagnosis Codes Panel */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Diagnosis Codes</CardTitle>
            <Button
              onClick={handleValidateDiagnosisCodes}
              disabled={isLoading.validation || acceptedCodes.diagnosis.length === 0}
              className="bg-medical-primary hover:bg-medical-primary/90"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              {isLoading.validation ? 'Validating...' : 'Validate Diagnoses'}
            </Button>
          </CardHeader>
          <CardContent>
            <ManualCodeEntry type="diagnosis" />
            <AnimatePresence mode="popLayout">
              <div className="mt-4 space-y-4">
                {acceptedCodes.diagnosis.map((code) => (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-medium">{code.code}</p>
                        <p className="text-sm text-muted-foreground">{code.description}</p>
                      </div>
                    </div>
                    {renderValidationStatus(code)}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </CardContent>
        </Card> */}

        {/* Service Codes Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Validate Service Codes</CardTitle>            
          </CardHeader>
          <CardContent>
            <ManualCodeEntry type="service" />
            <AnimatePresence mode="popLayout">
              <div className="mt-4 space-y-4">
                {acceptedCodes.service.map((code) => (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-medium">{code.code}</p>
                        <p className="text-sm text-muted-foreground">{code.description}</p>
                      </div>
                    </div>
                    {renderValidationStatus(code)}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
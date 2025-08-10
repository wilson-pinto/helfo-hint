import { SOAPInput } from '@/components/SOAPInput';
import { CodeSuggestions } from '@/components/CodeSuggestions';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export const CodeGuessing = () => {

  const { suggestedDiagnosisCodes, suggestedServiceCodes, errors } = useAppSelector((state) => state.medical);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <SOAPInput />

      <div className="flex items-center justify-between">
        <p className='text-2xl font-semibold leading-none tracking-tight text-medical-primary'>
          Suggested Diagnosis Codes
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="text-medical-primary">
                <PieChart className="h-4 w-4 mr-1" />
                Confidence Levels
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 p-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-confidence-high" />
                  <span>High (85%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-confidence-medium" />
                  <span>Medium (70-84%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-confidence-low" />
                  <span>Low (&lt;70%)</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CodeSuggestions
          type='diagnosis'
          codes={suggestedDiagnosisCodes}
          error={errors?.diagnosis}
        />
        <CodeSuggestions
          type='service'
          codes={suggestedServiceCodes}
          error={errors?.service}
        />
      </div>
    </motion.div>
  );
};
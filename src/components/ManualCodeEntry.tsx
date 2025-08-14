import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield } from 'lucide-react';
import { validateServiceCodes } from '@/store/slices/medicalSlice';
import { useState } from 'react';

interface ManualCodeEntryProps {
  type: 'diagnosis' | 'service';
}

export const ManualCodeEntry = ({ type }: ManualCodeEntryProps) => {
  const dispatch = useAppDispatch();
  const { ui, isLoading, acceptedCodes, soapNote } = useAppSelector((state) => state.medical);
  // Example options, replace with your dynamic values if needed
  const options = [
    { value: '2fev', label: '2fev' },
    { value: '3hrt', label: '3hrt' },
    { value: '4chr', label: '4chr' },
  ];
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [selectedItem]);

  const handleValidateServiceCodes = () => {
    dispatch(validateServiceCodes({ soapNote, inputCodes: selectedItem }));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button ref={triggerRef} type="button" variant="outline" className="flex-1">
              {selectedItem.length > 0 ? selectedItem.join(', ') : `Select ${type} code(s)...`}
            </Button>
          </PopoverTrigger>
          <PopoverContent style={triggerWidth ? { width: triggerWidth } : {}} className="p-2">
            <div className="flex flex-col gap-2">
              {options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedItem.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      let newSelected;
                      if (checked) {
                        newSelected = [...selectedItem, opt.value];
                      } else {
                        newSelected = selectedItem.filter((v) => v !== opt.value);
                      }
                      setSelectedItem(newSelected);
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleValidateServiceCodes} disabled={selectedItem.length === 0 || isLoading.servicecodeValidation}>{isLoading.servicecodeValidation ? 'Validating...' : 'Validate Service Codes'}</Button>
      </div>
    </div>
  );
};

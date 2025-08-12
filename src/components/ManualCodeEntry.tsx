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
  // Store selected values as an array in Redux (or local state if preferred)

  const [selectedItem, setSelectedItem] = useState<string[]>([]);

  // const handleSearch = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   const searchValue = ui.searchInput[type];

  //   if (!searchValue) return;

  //   try {
  //     const result = await networkService.codes.search(
  //       type === 'diagnosis' ? 'ICD-10' : 'HELFO',
  //       searchValue
  //     );

  //     if (result.data.status === 1 && result.data.data.length > 0) {
  //       const code = result.data.data[0];
  //       dispatch(acceptCode({
  //         id: `manual-${Date.now()}`,
  //         code: code.code,
  //         description: code.description,
  //         type,
  //         system: code.system,
  //         confidence: 100,
  //         accepted: true
  //       }));
  //     }
  //   } catch (error) {
  //     console.error('Error searching codes:', error);
  //   }
  // };

  const addServiceCode = () => {
    if (selectedItem) {
      // dispatch(addManualCode(selectedItem));
      setSelectedItem(null);
    }
  }


  const handleValidateServiceCodes = () => {
    dispatch(validateServiceCodes({ soapNote, inputCodes: selectedItem }));
  }

  return (
    <div className="space-y-4">
      <form className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="flex-1 justify-between">
              {selectedItem.length > 0 ? selectedItem.join(', ') : `Select ${type} code(s)...`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2">
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
        {/* <Button
          type='button'
          onClick={addServiceCode}
          disabled={isLoading.validation || !!!selectedItem}
          className="bg-medical-primary hover:bg-medical-primary-hover"
        >
          <Plus className="h-4 w-4" />
        </Button> */}
      </form>
      <Button
        onClick={handleValidateServiceCodes}
        disabled={isLoading.validation || selectedItem.length === 0}
        className="bg-medical-primary hover:bg-medical-primary/90"
        size="sm"
      >
        <Shield className="h-4 w-4 mr-2" />
        {isLoading.validation ? 'Validating...' : 'Validate Services'}
      </Button>
    </div>
  );
};
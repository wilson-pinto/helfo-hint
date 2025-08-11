import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { networkService } from '@/services/network';
import { acceptCode } from '@/store/slices/medicalSlice';

interface ManualCodeEntryProps {
  type: 'diagnosis' | 'service';
}

export const ManualCodeEntry = ({ type }: ManualCodeEntryProps) => {
  const dispatch = useAppDispatch();
  const { ui, isLoading } = useAppSelector((state) => state.medical);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const searchValue = ui.searchInput[type];
    
    if (!searchValue) return;

    try {
      const result = await networkService.codes.search(
        type === 'diagnosis' ? 'ICD-10' : 'HELFO',
        searchValue
      );

      if (result.data.status === 1 && result.data.data.length > 0) {
        const code = result.data.data[0];
        dispatch(acceptCode({
          id: `manual-${Date.now()}`,
          code: code.code,
          description: code.description,
          type,
          system: code.system,
          confidence: 100,
          accepted: true
        }));
      }
    } catch (error) {
      console.error('Error searching codes:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder={`Search ${type} codes...`}
          value={ui.searchInput[type]}
          onChange={(e) => dispatch({ 
            type: 'medical/setSearchInput',
            payload: { type, value: e.target.value }
          })}
          className="flex-1"
        />
        <Button 
          type="submit"
          disabled={isLoading.validation || !ui.searchInput[type]}
          className="bg-medical-primary hover:bg-medical-primary-hover"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
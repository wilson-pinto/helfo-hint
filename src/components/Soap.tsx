import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSoapString } from '../store/slices/medicalSlice';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';


interface SoapProps {
  buttonText: string;
  onButtonClick?: (soapString: string) => void;
  loading?: boolean;
}

const Soap: React.FC<SoapProps> = ({ buttonText, onButtonClick, loading = false }) => {
  const dispatch = useDispatch();
  const soapString = useSelector((state: RootState) => state.medical.soapString);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setSoapString(e.target.value));
  };

  const handleButtonClick = () => {
    onButtonClick(soapString);
  };

  return (
    <div className="space-y-4 pb-4">
      <Textarea
        value={soapString}
        onChange={handleChange}
        placeholder="Enter SOAP note..."
        rows={6}
        disabled={loading}
      />
      {!!onButtonClick && (
        <Button
          onClick={handleButtonClick}
          disabled={!soapString.trim() || loading}
          className="w-full flex items-center justify-center"
        >
          {loading ? (
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-2 border-gray-300 border-t-primary rounded-full inline-block"></span>
          ) : null}
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default Soap;
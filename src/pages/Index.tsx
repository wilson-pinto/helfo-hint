import { Header } from '../components/Header';
import { IntroSection } from '../components/IntroSection';
import { SOAPInput } from '../components/SOAPInput';
import { CodeSuggestions } from '../components/CodeSuggestions';
import { ServiceCodeSuggestions } from '../components/ServiceCodeSuggestions';
import { AcceptedCodes } from '../components/AcceptedCodes';
import { ManualCodeEntry } from '../components/ManualCodeEntry';
import { Footer } from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <IntroSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SOAPInput />
            <CodeSuggestions />
            <ServiceCodeSuggestions />
            <ManualCodeEntry />
          </div>
          
          <div className="lg:col-span-1">
            <AcceptedCodes />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;

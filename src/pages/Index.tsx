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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <IntroSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <SOAPInput />
              <div className="space-y-4 sm:space-y-6 transition-all duration-200">
                <CodeSuggestions />
                <ServiceCodeSuggestions />
                <ManualCodeEntry />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 transition-all duration-200">
                <AcceptedCodes />
              </div>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

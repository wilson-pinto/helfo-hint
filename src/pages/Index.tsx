import { Header } from '../components/Header';
import { IntroSection } from '../components/IntroSection';
import { SOAPInput } from '../components/SOAPInput';
import { CodeSuggestions } from '../components/CodeSuggestions';
import { ServiceCodeSuggestions } from '../components/ServiceCodeSuggestions';
import { ManualCodeEntry } from '../components/ManualCodeEntry';
import { Footer } from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <IntroSection />
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 mt-6 sm:mt-8">
              <SOAPInput />
              <div className="space-y-4 sm:space-y-6 transition-all duration-200">
                <CodeSuggestions />
                <ServiceCodeSuggestions />
                <ManualCodeEntry /> 
              </div>
            </div>
        </div>
        <div className="mt-8 sm:mt-10 lg:mt-12 bg-black/85">
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Index;

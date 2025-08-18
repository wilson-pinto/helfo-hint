import { useAppSelector } from '@/hooks/redux';
import { Layout } from '@/components/Layout';
import { CodeGuessing } from '@/pages/CodeGuessing';
import { CodeValidation } from '@/pages/CodeValidation';
import { Toaster } from '@/components/ui/toaster';
import Agentic from './pages/Agentic';
import { CodeSuggestions } from './components/CodeSuggestions';
import { ServiceCodeSuggestions } from './components/ServiceCodeSuggestions';

function App() {
  const { currentScreen, suggestedDiagnosisCodes, suggestedServiceCodes, errors } = useAppSelector((state) => state.medical);

  const getComponent = () => {
    if (currentScreen === 'guess-diagnosis-code') {
      return <CodeSuggestions
        suggestions={suggestedDiagnosisCodes}
        error={errors?.diagnosis}
      />
    }
    if (currentScreen === 'validate-service-code') {
      return <CodeValidation />;
    }
    if (currentScreen === 'guess-service-code') {
      return <ServiceCodeSuggestions
        suggestions={suggestedServiceCodes}
        error={errors?.service}
      />
    }
    if (currentScreen === 'agentic') {
      return <Agentic />;
    }
    return <></>
  }

  return (
    <>
      <Layout>
        {getComponent()}
      </Layout>
      <Toaster />
    </>
  );
}

export default App;

import { useAppSelector } from '@/hooks/redux';
import { Layout } from '@/components/Layout';
import { CodeGuessing } from '@/pages/CodeGuessing';
import { CodeValidation } from '@/pages/CodeValidation';
import { Toaster } from '@/components/ui/toaster';
import Agentic from './pages/Agentic';

function App() {
  const currentScreen = useAppSelector((state) => state.medical.currentScreen);

  const getComponent = () => {
    if (currentScreen === 'code-guessing') {
      return <CodeGuessing />;
    }
    if (currentScreen === 'code-validation') {
      return <CodeValidation />;
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

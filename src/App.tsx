import { useAppSelector } from '@/hooks/redux';
import { Layout } from '@/components/Layout';
import { CodeGuessing } from '@/pages/CodeGuessing';
import { CodeValidation } from '@/pages/CodeValidation';
import { Toaster } from '@/components/ui/toaster';
import Agentic from './pages/Agentic';

function App() {
  const currentScreen = useAppSelector((state) => state.medical.currentScreen);

  return (
    <>
      <Layout>
        <Agentic />
        {/* {currentScreen === 'code-guessing' ? <CodeGuessing /> : <CodeValidation />} */}
      </Layout>
      <Toaster />
    </>
  );
}

export default App;

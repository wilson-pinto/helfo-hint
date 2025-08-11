import { useAppSelector } from '@/hooks/redux';
import { Layout } from '@/components/Layout';
import { CodeGuessing } from '@/pages/CodeGuessing';
import { CodeValidation } from '@/pages/CodeValidation';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const currentScreen = useAppSelector((state) => state.medical.currentScreen);

  return (
    <>
      <Layout>
        {currentScreen === 'code-guessing' ? <CodeGuessing /> : <CodeValidation />}
      </Layout>
      <Toaster />
    </>
  );
}

export default App;

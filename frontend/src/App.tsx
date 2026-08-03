import { AppRouter } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Toaster } from 'sonner';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CourseProvider>
            <AppRouter />
            <Toaster position="top-right" richColors />
          </CourseProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

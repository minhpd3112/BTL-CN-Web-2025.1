import LoginPage from './pages/LoginPage';
import AppShell from './app/AppShell';
import useDemoAppState from './app/useDemoAppState';

export default function App() {
  const { state, actions } = useDemoAppState();

  // Show login page if not authenticated
  if (!state.currentUser && state.currentPage !== 'login') {
    return <LoginPage onLogin={actions.handleLogin} />;
  }

  if (state.currentPage === 'login') {
    return <LoginPage onLogin={actions.handleLogin} />;
  }

  // Show main application
  return <AppShell state={state} actions={actions} />;
}

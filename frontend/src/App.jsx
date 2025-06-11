import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Loading, { PageLoading } from './components/Loading';

// Lazy loading das páginas
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const QuestionsPage = React.lazy(() => import('./pages/QuestionsPage'));
const ExamsPage = React.lazy(() => import('./pages/ExamsPage'));
const CorrectionsPage = React.lazy(() => import('./pages/CorrectionsPage'));
const ScannerPage = React.lazy(() => import('./pages/ScannerPage'));

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading title="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rotas públicas (redireciona se já estiver logado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading title="Verificando autenticação..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isLoading } = useAuth();

  // Loading inicial da aplicação
  if (isLoading) {
    return (
      <PageLoading 
        title="Carregando Sistema de Provas..." 
        className="app-loading"
      />
    );
  }

  return (
    <div className="app">
      <Suspense fallback={<PageLoading title="Carregando página..." />}>
        <Routes>
          {/* Rota pública - Login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Questões */}
            <Route path="questoes" element={<QuestionsPage />} />

            {/* Provas */}
            <Route path="provas" element={<ExamsPage />} />

            {/* Correções */}
            <Route path="correcoes" element={<CorrectionsPage />} />

            {/* Scanner QR */}
            <Route path="scanner" element={<ScannerPage />} />
          </Route>

          {/* Rota 404 */}
          <Route
            path="*"
            element={
              <div className="error-page">
                <div className="error-content">
                  <h1>404</h1>
                  <p>Página não encontrada</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
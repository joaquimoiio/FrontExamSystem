import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Hook principal de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Hook para redirecionamento após login
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectAfterLogin = () => {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };
  
  const redirectToLogin = (from = null) => {
    navigate('/login', { 
      state: { from: from || location },
      replace: true 
    });
  };
  
  return {
    redirectAfterLogin,
    redirectToLogin,
  };
};

// Hook para proteção de rotas
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { redirectToLogin } = useAuthRedirect();
  
  const checkAuth = () => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin();
      return false;
    }
    return true;
  };
  
  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
};

// Hook para permissões
export const usePermissions = () => {
  const { user, hasPermission } = useAuth();
  
  const can = (permission) => {
    return hasPermission(permission);
  };
  
  const canEdit = (resourceUserId) => {
    return user?.id === resourceUserId || user?.role === 'admin';
  };
  
  const canDelete = (resourceUserId) => {
    return user?.id === resourceUserId || user?.role === 'admin';
  };
  
  const isOwner = (resourceUserId) => {
    return user?.id === resourceUserId;
  };
  
  const isAdmin = () => {
    return user?.role === 'admin' || user?.isAdmin;
  };
  
  return {
    can,
    canEdit,
    canDelete,
    isOwner,
    isAdmin,
    user,
  };
};

// Hook para dados do usuário
export const useUserData = () => {
  const { user, updateProfile } = useAuth();
  
  const getUserInfo = () => ({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    institution: user?.institution,
    subject: user?.subject,
    createdAt: user?.created_at,
    lastLogin: user?.last_login,
  });
  
  const getInitials = () => {
    if (!user?.name) return 'U';
    
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  const getDisplayName = () => {
    return user?.name || user?.email || 'Usuário';
  };
  
  return {
    user,
    updateProfile,
    getUserInfo,
    getInitials,
    getDisplayName,
  };
};

// Hook para status de autenticação
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  const status = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (isAuthenticated) return 'authenticated';
    return 'unauthenticated';
  };
  
  const isReady = () => !isLoading;
  const hasError = () => !!error;
  
  return {
    status: status(),
    isLoading,
    isAuthenticated,
    isReady,
    hasError,
    error,
  };
};

export default useAuth;
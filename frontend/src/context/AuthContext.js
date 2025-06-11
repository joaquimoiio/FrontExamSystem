import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import { toast } from 'react-hot-toast';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const token = authService.getToken();
        if (token) {
          // Verificar se o token é válido
          const user = await authService.getCurrentUser();
          if (user) {
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: { user, token },
            });
          } else {
            // Token inválido, fazer logout
            authService.logout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.login(email, password);
      
      if (response.user && response.token) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        
        toast.success('Login realizado com sucesso!');
        return { success: true };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.register(userData);
      
      if (response.user && response.token) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        
        toast.success('Conta criada com sucesso!');
        return { success: true };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar conta';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logout realizado com sucesso!');
  };

  // Atualizar perfil
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });
      
      toast.success('Perfil atualizado com sucesso!');
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao atualizar perfil';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Alterar senha
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao alterar senha';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Recuperar senha
  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Instruções de recuperação enviadas para seu email!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao enviar recuperação';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset de senha
  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Senha redefinida com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao redefinir senha';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Limpar erro
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Verificar se tem permissão
  const hasPermission = (permission) => {
    // Por enquanto, todos os usuários autenticados têm todas as permissões
    // Pode ser expandido futuramente para incluir sistema de roles
    return state.isAuthenticated;
  };

  // Verificar se é o próprio usuário
  const isOwnUser = (userId) => {
    return state.user?.id === userId;
  };

  // Obter dados do usuário
  const getUserData = () => {
    return state.user;
  };

  // Verificar se está carregando
  const isLoading = () => {
    return state.isLoading;
  };

  // Verificar se está autenticado
  const isAuthenticated = () => {
    return state.isAuthenticated;
  };

  // Obter token
  const getToken = () => {
    return state.token;
  };

  // Valor do contexto
  const value = {
    // Estado
    ...state,
    
    // Métodos de autenticação
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    
    // Métodos utilitários
    hasPermission,
    isOwnUser,
    getUserData,
    isLoading: isLoading,
    isAuthenticated: isAuthenticated,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// HOC para componentes que requerem autenticação
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="d-flex justify-center align-center" style={{ minHeight: '200px' }}>
          <div className="loading-spinner lg"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Redirecionar para login ou mostrar componente de acesso negado
      return null;
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;
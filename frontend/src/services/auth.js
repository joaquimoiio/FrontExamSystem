import { apiServices, validateData } from './api';

// Chaves do localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

export const authService = {
  // Login
  async login(email, password, rememberMe = false) {
    // Validações básicas
    if (!validateData.email(email)) {
      throw new Error('Email inválido');
    }
    
    if (!validateData.password(password)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      const response = await apiServices.auth.login(email, password);
      
      if (response.token && response.user) {
        // Salvar token e dados do usuário
        this.setToken(response.token, rememberMe);
        this.setUser(response.user, rememberMe);
        
        return {
          success: true,
          user: response.user,
          token: response.token,
          message: response.message || 'Login realizado com sucesso',
        };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      throw error;
    }
  },

  // Registro
  async register(userData) {
    // Validações básicas
    if (!validateData.notEmpty(userData.name)) {
      throw new Error('Nome é obrigatório');
    }
    
    if (!validateData.email(userData.email)) {
      throw new Error('Email inválido');
    }
    
    if (!validateData.password(userData.password)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      const response = await apiServices.auth.register(userData);
      
      if (response.token && response.user) {
        // Salvar token e dados do usuário
        this.setToken(response.token);
        this.setUser(response.user);
        
        return {
          success: true,
          user: response.user,
          token: response.token,
          message: response.message || 'Conta criada com sucesso',
        };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout() {
    try {
      // Tentar fazer logout no servidor (não crítico se falhar)
      apiServices.auth.logout().catch(console.error);
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Sempre limpar dados locais
      this.clearStorage();
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await apiServices.auth.profile();
      
      if (response.user) {
        // Atualizar dados do usuário no storage
        this.setUser(response.user);
        return response.user;
      }
      
      return null;
    } catch (error) {
      // Se falhar, remover token inválido
      this.clearStorage();
      return null;
    }
  },

  // Atualizar perfil
  async updateProfile(userData) {
    try {
      const response = await apiServices.auth.updateProfile(userData);
      
      if (response.user) {
        // Atualizar dados do usuário no storage
        this.setUser(response.user);
        return response.user;
      }
      
      throw new Error('Resposta inválida do servidor');
    } catch (error) {
      throw error;
    }
  },

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    // Validações
    if (!validateData.notEmpty(currentPassword)) {
      throw new Error('Senha atual é obrigatória');
    }
    
    if (!validateData.password(newPassword)) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }
    
    if (currentPassword === newPassword) {
      throw new Error('A nova senha deve ser diferente da atual');
    }

    try {
      const response = await apiServices.auth.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Recuperar senha
  async forgotPassword(email) {
    if (!validateData.email(email)) {
      throw new Error('Email inválido');
    }

    try {
      const response = await apiServices.auth.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Redefinir senha
  async resetPassword(token, newPassword) {
    if (!validateData.notEmpty(token)) {
      throw new Error('Token de recuperação é obrigatório');
    }
    
    if (!validateData.password(newPassword)) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }

    try {
      const response = await apiServices.auth.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Gerenciamento do token
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  },

  // Gerenciamento dos dados do usuário
  getUser() {
    try {
      const userData = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  },

  setUser(user, remember = false) {
    const userData = JSON.stringify(user);
    
    if (remember || localStorage.getItem(REMEMBER_ME_KEY)) {
      localStorage.setItem(USER_KEY, userData);
    } else {
      sessionStorage.setItem(USER_KEY, userData);
    }
  },

  removeUser() {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  // Limpar todo o storage
  clearStorage() {
    this.removeToken();
    this.removeUser();
    localStorage.removeItem(REMEMBER_ME_KEY);
  },

  // Verificações de estado
  isAuthenticated() {
    return !!this.getToken();
  },

  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar JWT (apenas o payload, sem verificar assinatura)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      // Se não conseguir decodificar, considerar expirado
      return true;
    }
  },

  // Informações do usuário
  getUserId() {
    const user = this.getUser();
    return user?.id;
  },

  getUserName() {
    const user = this.getUser();
    return user?.name;
  },

  getUserEmail() {
    const user = this.getUser();
    return user?.email;
  },

  getUserInstitution() {
    const user = this.getUser();
    return user?.institution;
  },

  getUserSubject() {
    const user = this.getUser();
    return user?.subject;
  },

  // Validar sessão
  async validateSession() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      if (this.isTokenExpired()) {
        this.clearStorage();
        return false;
      }

      // Verificar se o usuário ainda é válido no servidor
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      this.clearStorage();
      return false;
    }
  },

  // Refresh automático (caso implementado no backend)
  async refreshToken() {
    try {
      // Esta funcionalidade dependeria de um endpoint de refresh no backend
      // Por enquanto, apenas verifica se o token ainda é válido
      return await this.validateSession();
    } catch (error) {
      this.clearStorage();
      return false;
    }
  },

  // Configurar interceptor para refresh automático
  setupTokenRefresh() {
    // Verificar token a cada 5 minutos
    setInterval(async () => {
      if (this.isAuthenticated() && this.isTokenExpired()) {
        try {
          await this.refreshToken();
        } catch (error) {
          console.error('Erro ao renovar token:', error);
          this.logout();
        }
      }
    }, 5 * 60 * 1000); // 5 minutos
  },

  // Inicialização do serviço
  init() {
    this.setupTokenRefresh();
  },

  // Eventos de autenticação
  onAuthChange(callback) {
    // Escutar mudanças no localStorage para sincronizar entre abas
    window.addEventListener('storage', (event) => {
      if (event.key === TOKEN_KEY || event.key === USER_KEY) {
        callback(this.isAuthenticated(), this.getUser());
      }
    });
  },

  // Permissões (pode ser expandido futuramente)
  hasPermission(permission) {
    // Por enquanto, usuário autenticado tem todas as permissões
    return this.isAuthenticated();
  },

  // Verificar se é admin (para futuras implementações)
  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin' || user?.isAdmin;
  },

  // Debug (apenas em desenvolvimento)
  debug() {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth Debug:', {
        isAuthenticated: this.isAuthenticated(),
        token: this.getToken(),
        user: this.getUser(),
        isTokenExpired: this.isTokenExpired(),
      });
    }
  },
};

// Inicializar serviço
authService.init();

export default authService;
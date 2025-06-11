import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratar erros comuns
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Só redirecionar se não estivermos já na página de login
          if (!window.location.pathname.includes('/login')) {
            toast.error('Sessão expirada. Faça login novamente.');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Você não tem permissão para acessar este recurso.');
          break;
          
        case 404:
          toast.error('Recurso não encontrado.');
          break;
          
        case 422:
          // Erros de validação
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data.message || 'Dados inválidos.');
          }
          break;
          
        case 429:
          toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
          break;
          
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
          break;
          
        default:
          // Outros erros
          const message = data?.message || `Erro ${status}: ${error.message}`;
          toast.error(message);
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      toast.error(error.message || 'Erro inesperado.');
    }
    
    return Promise.reject(error);
  }
);

// Utilitários para requisições
export const apiUtils = {
  // GET
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload de arquivo
  upload: async (url, file, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await api.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download de arquivo
  download: async (url, filename = null) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Criar URL do blob
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();

      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Busca com parâmetros de paginação
  paginate: async (url, page = 1, limit = 10, filters = {}) => {
    try {
      const params = {
        page,
        limit,
        ...filters,
      };

      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviços específicos da API
export const apiServices = {
  // Autenticação
  auth: {
    login: (email, password) => 
      apiUtils.post('/auth/login', { email, password }),
    
    register: (userData) => 
      apiUtils.post('/auth/register', userData),
    
    logout: () => 
      apiUtils.post('/auth/logout'),
    
    profile: () => 
      apiUtils.get('/auth/profile'),
    
    updateProfile: (userData) => 
      apiUtils.put('/auth/profile', userData),
    
    changePassword: (currentPassword, newPassword) => 
      apiUtils.post('/auth/change-password', { currentPassword, newPassword }),
    
    forgotPassword: (email) => 
      apiUtils.post('/auth/forgot-password', { email }),
    
    resetPassword: (token, newPassword) => 
      apiUtils.post('/auth/reset-password', { token, newPassword }),
  },

  // Questões
  questions: {
    getAll: (page, limit, filters) => 
      apiUtils.paginate('/questions', page, limit, filters),
    
    getById: (id) => 
      apiUtils.get(`/questions/${id}`),
    
    create: (questionData) => 
      apiUtils.post('/questions', questionData),
    
    update: (id, questionData) => 
      apiUtils.put(`/questions/${id}`, questionData),
    
    delete: (id) => 
      apiUtils.delete(`/questions/${id}`),
    
    getStats: () => 
      apiUtils.get('/questions/stats'),
    
    getForExam: (filters) => 
      apiUtils.get('/questions/for-exam', { params: filters }),
  },

  // Provas
  exams: {
    getAll: (page, limit, filters) => 
      apiUtils.paginate('/exams', page, limit, filters),
    
    getById: (id) => 
      apiUtils.get(`/exams/${id}`),
    
    create: (examData) => 
      apiUtils.post('/exams', examData),
    
    update: (id, examData) => 
      apiUtils.put(`/exams/${id}`, examData),
    
    delete: (id) => 
      apiUtils.delete(`/exams/${id}`),
    
    generateQuestions: (id) => 
      apiUtils.post(`/exams/${id}/generate-questions`),
    
    generatePDF: (id) => 
      apiUtils.download(`/exams/${id}/pdf`, `prova-${id}.pdf`),
    
    getByQRCode: (qrCode) => 
      apiUtils.post('/exams/qrcode', { qr_code: qrCode }),
    
    getStats: (id) => 
      apiUtils.get(`/exams/${id}/stats`),
  },

  // Correções
  corrections: {
    getAll: (page, limit, filters) => 
      apiUtils.paginate('/corrections', page, limit, filters),
    
    getById: (id) => 
      apiUtils.get(`/corrections/${id}`),
    
    create: (correctionData) => 
      apiUtils.post('/corrections', correctionData),
    
    update: (id, correctionData) => 
      apiUtils.put(`/corrections/${id}`, correctionData),
    
    delete: (id) => 
      apiUtils.delete(`/corrections/${id}`),
    
    correct: (id) => 
      apiUtils.post(`/corrections/${id}/correct`),
    
    correctByQRCode: (qrData) => 
      apiUtils.post('/corrections/qrcode', qrData),
    
    updateObservations: (id, observations) => 
      apiUtils.put(`/corrections/${id}/observations`, { observacoes: observations }),
    
    getExamAnswers: (examId) => 
      apiUtils.get(`/corrections/exam/${examId}`),
    
    exportResults: (examId) => 
      apiUtils.get(`/corrections/exam/${examId}/export`),
  },

  // Categorias
  categories: {
    getTree: () => 
      apiUtils.get('/categories/tree'),
    
    getRoot: () => 
      apiUtils.get('/categories/root'),
    
    getById: (id) => 
      apiUtils.get(`/categories/${id}`),
    
    create: (categoryData) => 
      apiUtils.post('/categories', categoryData),
    
    update: (id, categoryData) => 
      apiUtils.put(`/categories/${id}`, categoryData),
    
    delete: (id) => 
      apiUtils.delete(`/categories/${id}`),
    
    move: (id, moveData) => 
      apiUtils.patch(`/categories/${id}/move`, moveData),
    
    getQuestions: (id, page, limit, includeSubcategories) => 
      apiUtils.paginate(`/categories/${id}/questions`, page, limit, { include_subcategories: includeSubcategories }),
    
    getStats: () => 
      apiUtils.get('/categories/stats'),
  },
};

// Configurações adicionais
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  
  // Headers padrão
  getDefaultHeaders: () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }),
  
  // Headers com autenticação
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      ...apiConfig.getDefaultHeaders(),
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
  
  // Verificar se a API está online
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};

// Utilitários para cache
export const cacheUtils = {
  // Cache simples com localStorage
  set: (key, data, expirationMinutes = 60) => {
    const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
    const cacheData = {
      data,
      expiration: expirationTime,
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
  },

  get: (key) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = new Date().getTime();

      if (now > cacheData.expiration) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      return null;
    }
  },

  remove: (key) => {
    localStorage.removeItem(`cache_${key}`);
  },

  clear: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  },
};

// Retry automático para requisições
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Não fazer retry em erros 4xx (exceto 429)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Aguardar antes do próximo retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
};

// Validações de dados antes do envio
export const validateData = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    return password && password.length >= 6;
  },

  uuid: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  notEmpty: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  },
};

// Rate limiting local
const requestCounts = new Map();

export const rateLimit = {
  check: (key, maxRequests = 10, windowMs = 60000) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }
    
    const requests = requestCounts.get(key);
    
    // Remover requisições antigas
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit excedido
    }
    
    // Adicionar nova requisição
    validRequests.push(now);
    requestCounts.set(key, validRequests);
    
    return true; // Pode fazer a requisição
  },

  reset: (key) => {
    requestCounts.delete(key);
  },

  clear: () => {
    requestCounts.clear();
  },
};

export default api;
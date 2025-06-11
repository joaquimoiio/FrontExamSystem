import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiServices, apiUtils } from '../services/api';
import { toast } from 'react-hot-toast';

// Hook genérico para requisições de API
export const useApi = (key, fetchFn, options = {}) => {
  const {
    enabled = true,
    showError = true,
    showSuccess = false,
    successMessage = 'Operação realizada com sucesso',
    ...queryOptions
  } = options;

  return useQuery(
    key,
    fetchFn,
    {
      enabled,
      onError: (error) => {
        if (showError) {
          const message = error.response?.data?.message || error.message || 'Erro na requisição';
          toast.error(message);
        }
      },
      onSuccess: (data) => {
        if (showSuccess) {
          toast.success(successMessage);
        }
      },
      ...queryOptions,
    }
  );
};

// Hook para mutações
export const useMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const {
    showError = true,
    showSuccess = true,
    successMessage = 'Operação realizada com sucesso',
    invalidateQueries = [],
    ...mutationOptions
  } = options;

  return useMutation(
    mutationFn,
    {
      onSuccess: (data, variables, context) => {
        if (showSuccess) {
          toast.success(successMessage);
        }
        
        // Invalidar queries especificadas
        if (invalidateQueries.length > 0) {
          invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries(queryKey);
          });
        }
        
        if (mutationOptions.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        if (showError) {
          const message = error.response?.data?.message || error.message || 'Erro na operação';
          toast.error(message);
        }
        
        if (mutationOptions.onError) {
          mutationOptions.onError(error, variables, context);
        }
      },
      ...mutationOptions,
    }
  );
};

// Hook para paginação
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, newPage));
  }, []);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    reset,
  };
};

// Hook para filtros
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => 
      filters[key] !== '' && 
      filters[key] !== null && 
      filters[key] !== undefined
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
  };
};

// Hooks específicos para entidades

// Questões
export const useQuestions = (page = 1, limit = 10, filters = {}) => {
  const pagination = usePagination(page, limit);
  const filtersHook = useFilters(filters);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApi(
    ['questions', pagination.page, pagination.limit, filtersHook.filters],
    () => apiServices.questions.getAll(pagination.page, pagination.limit, filtersHook.filters),
    {
      keepPreviousData: true,
    }
  );

  const createQuestion = useMutation(
    apiServices.questions.create,
    {
      successMessage: 'Questão criada com sucesso',
      invalidateQueries: [['questions']],
    }
  );

  const updateQuestion = useMutation(
    ({ id, data }) => apiServices.questions.update(id, data),
    {
      successMessage: 'Questão atualizada com sucesso',
      invalidateQueries: [['questions']],
    }
  );

  const deleteQuestion = useMutation(
    apiServices.questions.delete,
    {
      successMessage: 'Questão excluída com sucesso',
      invalidateQueries: [['questions']],
    }
  );

  return {
    // Dados
    questions: data?.questions || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    
    // Ações
    refetch,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    
    // Controles
    ...pagination,
    ...filtersHook,
  };
};

// Provas
export const useExams = (page = 1, limit = 10, filters = {}) => {
  const pagination = usePagination(page, limit);
  const filtersHook = useFilters(filters);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApi(
    ['exams', pagination.page, pagination.limit, filtersHook.filters],
    () => apiServices.exams.getAll(pagination.page, pagination.limit, filtersHook.filters),
    {
      keepPreviousData: true,
    }
  );

  const createExam = useMutation(
    apiServices.exams.create,
    {
      successMessage: 'Prova criada com sucesso',
      invalidateQueries: [['exams']],
    }
  );

  const updateExam = useMutation(
    ({ id, data }) => apiServices.exams.update(id, data),
    {
      successMessage: 'Prova atualizada com sucesso',
      invalidateQueries: [['exams']],
    }
  );

  const deleteExam = useMutation(
    apiServices.exams.delete,
    {
      successMessage: 'Prova excluída com sucesso',
      invalidateQueries: [['exams']],
    }
  );

  const generateQuestions = useMutation(
    apiServices.exams.generateQuestions,
    {
      successMessage: 'Questões geradas com sucesso',
      invalidateQueries: [['exams']],
    }
  );

  const generatePDF = useMutation(
    apiServices.exams.generatePDF,
    {
      successMessage: 'PDF gerado com sucesso',
      showError: true,
    }
  );

  return {
    // Dados
    exams: data?.exams || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    
    // Ações
    refetch,
    createExam,
    updateExam,
    deleteExam,
    generateQuestions,
    generatePDF,
    
    // Controles
    ...pagination,
    ...filtersHook,
  };
};

// Correções
export const useCorrections = (page = 1, limit = 10, filters = {}) => {
  const pagination = usePagination(page, limit);
  const filtersHook = useFilters(filters);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApi(
    ['corrections', pagination.page, pagination.limit, filtersHook.filters],
    () => apiServices.corrections.getAll(pagination.page, pagination.limit, filtersHook.filters),
    {
      keepPreviousData: true,
    }
  );

  const createCorrection = useMutation(
    apiServices.corrections.create,
    {
      successMessage: 'Resposta registrada com sucesso',
      invalidateQueries: [['corrections']],
    }
  );

  const correctExam = useMutation(
    apiServices.corrections.correct,
    {
      successMessage: 'Prova corrigida com sucesso',
      invalidateQueries: [['corrections']],
    }
  );

  const correctByQRCode = useMutation(
    apiServices.corrections.correctByQRCode,
    {
      successMessage: 'Prova corrigida com sucesso',
      invalidateQueries: [['corrections']],
    }
  );

  const updateObservations = useMutation(
    ({ id, observations }) => apiServices.corrections.updateObservations(id, observations),
    {
      successMessage: 'Observações atualizadas com sucesso',
      invalidateQueries: [['corrections']],
    }
  );

  return {
    // Dados
    corrections: data?.answers || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    
    // Ações
    refetch,
    createCorrection,
    correctExam,
    correctByQRCode,
    updateObservations,
    
    // Controles
    ...pagination,
    ...filtersHook,
  };
};

// Hook para uma entidade específica
export const useEntity = (entityType, id, options = {}) => {
  const service = apiServices[entityType];
  
  if (!service) {
    throw new Error(`Serviço não encontrado para entidade: ${entityType}`);
  }

  return useApi(
    [entityType, id],
    () => service.getById(id),
    {
      enabled: !!id,
      ...options,
    }
  );
};

// Hook para estatísticas
export const useStats = (entityType, id = null) => {
  const service = apiServices[entityType];
  
  if (!service?.getStats) {
    throw new Error(`Serviço de estatísticas não encontrado para: ${entityType}`);
  }

  const queryKey = id ? [entityType, 'stats', id] : [entityType, 'stats'];
  const queryFn = id ? () => service.getStats(id) : () => service.getStats();

  return useApi(queryKey, queryFn, {
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para busca
export const useSearch = (entityType, searchTerm, options = {}) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const service = apiServices[entityType];
  
  return useApi(
    [entityType, 'search', debouncedTerm],
    () => service.getAll(1, 50, { search: debouncedTerm }),
    {
      enabled: debouncedTerm.length >= 2,
      ...options,
    }
  );
};

// Hook para upload
export const useUpload = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useMutation(
    ({ url, file }) => apiUtils.upload(url, file, (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setProgress(percentCompleted);
    }),
    {
      onMutate: () => {
        setIsUploading(true);
        setProgress(0);
      },
      onSettled: () => {
        setIsUploading(false);
        setProgress(0);
      },
    }
  );

  return {
    upload,
    progress,
    isUploading,
  };
};

export default {
  useApi,
  useMutation,
  usePagination,
  useFilters,
  useQuestions,
  useExams,
  useCorrections,
  useEntity,
  useStats,
  useSearch,
  useUpload,
};
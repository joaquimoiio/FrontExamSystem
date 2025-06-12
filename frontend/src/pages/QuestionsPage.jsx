import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Table, { TableActions, TablePagination } from '../components/Table';
import Modal, { ConfirmModal, useConfirmModal } from '../components/Modal';
import Button from '../components/Button';
import { useQuestions } from '../hooks/useApi';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filters, setFilters] = useState({
    nivel_dificuldade: '',
    tags_assuntos: ''
  });

  // Hook para gerenciar questões
  const {
    questions,
    pagination,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    refetch,
    page,
    limit,
    goToPage,
    changeLimit,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useQuestions(1, 10, filters);

  // Modal de confirmação
  const { showConfirm, ConfirmModal: ConfirmModalComponent } = useConfirmModal();

  // Estatísticas das questões
  const stats = {
    total: pagination.total_items || 0,
    facil: questions.filter(q => q.nivel_dificuldade === 'Fácil').length,
    medio: questions.filter(q => q.nivel_dificuldade === 'Médio').length,
    dificil: questions.filter(q => q.nivel_dificuldade === 'Difícil').length
  };

  // Colunas da tabela
  const columns = [
    {
      key: 'texto_questao',
      title: 'Questão',
      render: (value) => (
        <div className="question-preview" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'nivel_dificuldade',
      title: 'Dificuldade',
      render: (value) => (
        <span className={`difficulty-badge ${value?.toLowerCase() || 'medio'}`}>
          {value}
        </span>
      ),
      align: 'center'
    },
    {
      key: 'alternativas',
      title: 'Alternativas',
      render: (value) => value?.length || 0,
      align: 'center'
    },
    {
      key: 'tags_assuntos',
      title: 'Tags',
      render: (value) => (
        <div className="question-tags">
          {value?.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
          {value?.length > 3 && (
            <span className="tag">+{value.length - 3}</span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Criado em',
      type: 'date'
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_, item) => (
        <TableActions
          actions={[
            {
              icon: '👁️',
              title: 'Ver detalhes',
              onClick: () => handleViewQuestion(item),
              variant: 'primary'
            },
            {
              icon: '✏️',
              title: 'Editar',
              onClick: () => handleEditQuestion(item),
              variant: 'primary'
            },
            {
              icon: '🗑️',
              title: 'Excluir',
              onClick: () => handleDeleteQuestion(item),
              variant: 'danger'
            }
          ]}
          item={item}
        />
      ),
      align: 'center',
      sortable: false
    }
  ];

  // Handlers
  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setIsCreateModalOpen(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setIsCreateModalOpen(true);
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setIsDetailModalOpen(true);
  };

  const handleDeleteQuestion = (question) => {
    showConfirm({
      title: 'Excluir Questão',
      message: 'Tem certeza que deseja excluir esta questão?',
      description: 'Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      confirmVariant: 'danger',
      icon: '🗑️',
      iconVariant: 'danger',
      onConfirm: async () => {
        await deleteQuestion.mutateAsync(question.id);
      }
    });
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  // Paginação
  const paginationProps = TablePagination({
    currentPage: page,
    totalPages: pagination.total_pages || 1,
    totalItems: pagination.total_items || 0,
    itemsPerPage: limit,
    onPageChange: goToPage,
    onItemsPerPageChange: changeLimit
  });

  return (
    <div className="questions-page">
      {/* Header */}
      <div className="questions-header">
        <h1 className="questions-title">Banco de Questões</h1>
        <div className="questions-actions">
          <Button
            variant="outline-secondary"
            icon="🔄"
            onClick={() => refetch()}
            loading={isLoading}
          >
            Atualizar
          </Button>
          <Button
            variant="primary"
            icon="➕"
            onClick={handleCreateQuestion}
          >
            Nova Questão
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="questions-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.facil}</div>
          <div className="stat-label">Fáceis</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.medio}</div>
          <div className="stat-label">Médias</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.dificil}</div>
          <div className="stat-label">Difíceis</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="questions-filters">
        <div className="filter-group">
          <label className="filter-label">Dificuldade:</label>
          <select
            className="filter-select"
            value={filters.nivel_dificuldade}
            onChange={(e) => handleFilterChange('nivel_dificuldade', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Fácil">Fácil</option>
            <option value="Médio">Médio</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Tag:</label>
          <input
            type="text"
            className="filter-select"
            placeholder="Filtrar por tag..."
            value={filters.tags_assuntos}
            onChange={(e) => handleFilterChange('tags_assuntos', e.target.value)}
          />
        </div>

        {hasActiveFilters() && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClearFilters}
            className="clear-filters"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="questions-table">
        <Table
          data={questions}
          columns={columns}
          loading={isLoading}
          error={error}
          pagination={paginationProps}
          emptyMessage="Nenhuma questão encontrada"
          emptyDescription="Crie sua primeira questão para começar"
          emptyIcon="❓"
        />
      </div>

      {/* Modal de Criação/Edição */}
      <QuestionFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        question={selectedQuestion}
        onSave={selectedQuestion ? updateQuestion : createQuestion}
      />

      {/* Modal de Detalhes */}
      <QuestionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        question={selectedQuestion}
        onEdit={handleEditQuestion}
        onDelete={handleDeleteQuestion}
      />

      {/* Modal de Confirmação */}
      <ConfirmModalComponent />
    </div>
  );
};

// Modal de formulário de questão
const QuestionFormModal = ({ isOpen, onClose, question, onSave }) => {
  const isEditing = !!question;
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      texto_questao: '',
      alternativas: [{ value: '' }, { value: '' }],
      resposta_correta: 'A',
      nivel_dificuldade: 'Médio',
      tags_assuntos: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'alternativas'
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (question) {
        reset({
          texto_questao: question.texto_questao,
          alternativas: question.alternativas.map(alt => ({ value: alt })),
          resposta_correta: question.resposta_correta,
          nivel_dificuldade: question.nivel_dificuldade,
          tags_assuntos: question.tags_assuntos || []
        });
        setTags(question.tags_assuntos || []);
      } else {
        reset({
          texto_questao: '',
          alternativas: [{ value: '' }, { value: '' }],
          resposta_correta: 'A',
          nivel_dificuldade: 'Médio',
          tags_assuntos: []
        });
        setTags([]);
      }
    }
  }, [isOpen, question, reset]);

  const onSubmit = async (data) => {
    try {
      const questionData = {
        ...data,
        alternativas: data.alternativas.map(alt => alt.value).filter(Boolean),
        tags_assuntos: tags
      };

      if (isEditing) {
        await onSave.mutateAsync({ id: question.id, data: questionData });
      } else {
        await onSave.mutateAsync(questionData);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar questão:', error);
    }
  };

  const addAlternative = () => {
    if (fields.length < 5) {
      append({ value: '' });
    }
  };

  const removeAlternative = (index) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags_assuntos', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags_assuntos', newTags);
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Questão' : 'Nova Questão'}
      size="lg"
      loading={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="question-form">
        {/* Texto da questão */}
        <div className="form-group">
          <label className="form-label required">Texto da Questão</label>
          <textarea
            className={`form-control question-textarea ${errors.texto_questao ? 'is-invalid' : ''}`}
            placeholder="Digite o enunciado da questão..."
            {...register('texto_questao', {
              required: 'Texto da questão é obrigatório',
              minLength: { value: 10, message: 'Mínimo de 10 caracteres' }
            })}
          />
          {errors.texto_questao && (
            <div className="invalid-feedback">{errors.texto_questao.message}</div>
          )}
        </div>

        {/* Alternativas */}
        <div className="alternatives-container">
          <div className="alternatives-header">
            <h4 className="alternatives-title">Alternativas</h4>
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              onClick={addAlternative}
              disabled={fields.length >= 5}
            >
              Adicionar
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="alternative-item">
              <div className="alternative-letter">
                {String.fromCharCode(65 + index)}
              </div>
              <input
                type="text"
                className="alternative-input"
                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                {...register(`alternativas.${index}.value`, {
                  required: 'Alternativa é obrigatória'
                })}
              />
              <div className="alternative-actions">
                <label title="Resposta correta">
                  <input
                    type="radio"
                    className="correct-answer-radio"
                    value={String.fromCharCode(65 + index)}
                    {...register('resposta_correta')}
                  />
                </label>
                {fields.length > 2 && (
                  <button
                    type="button"
                    className="remove-alternative"
                    onClick={() => removeAlternative(index)}
                    title="Remover alternativa"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nível de dificuldade */}
        <div className="form-group">
          <label className="form-label required">Nível de Dificuldade</label>
          <select
            className={`form-control ${errors.nivel_dificuldade ? 'is-invalid' : ''}`}
            {...register('nivel_dificuldade', { required: 'Selecione a dificuldade' })}
          >
            <option value="Fácil">Fácil</option>
            <option value="Médio">Médio</option>
            <option value="Difícil">Difícil</option>
          </select>
          {errors.nivel_dificuldade && (
            <div className="invalid-feedback">{errors.nivel_dificuldade.message}</div>
          )}
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags/Assuntos</label>
          <div className="tags-input-container">
            <input
              type="text"
              className="tags-input"
              placeholder="Digite uma tag e pressione Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
            />
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map((tag, index) => (
                  <div key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="modal-footer">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {isEditing ? 'Atualizar' : 'Criar'} Questão
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de detalhes da questão
const QuestionDetailModal = ({ isOpen, onClose, question, onEdit, onDelete }) => {
  if (!question) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Questão"
      size="lg"
    >
      <div className="question-detail">
        {/* Metadados */}
        <div className="question-metadata">
          <div className="metadata-item">
            <div className="metadata-label">Dificuldade</div>
            <div className="metadata-value">
              <span className={`difficulty-badge ${question.nivel_dificuldade?.toLowerCase()}`}>
                {question.nivel_dificuldade}
              </span>
            </div>
          </div>
          <div className="metadata-item">
            <div className="metadata-label">Criado em</div>
            <div className="metadata-value">
              {new Date(question.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="metadata-item">
            <div className="metadata-label">Resposta Correta</div>
            <div className="metadata-value">{question.resposta_correta}</div>
          </div>
        </div>

        {/* Texto da questão */}
        <div className="question-text">
          {question.texto_questao}
        </div>

        {/* Alternativas */}
        <div className="alternatives-list">
          {question.alternativas?.map((alternativa, index) => (
            <div
              key={index}
              className={`alternative-option ${
                String.fromCharCode(65 + index) === question.resposta_correta ? 'correct' : ''
              }`}
            >
              <div className="alternative-letter">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="alternative-text">{alternativa}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {question.tags_assuntos && question.tags_assuntos.length > 0 && (
          <div className="question-tags">
            {question.tags_assuntos.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="modal-footer">
          <Button
            variant="danger"
            onClick={() => onDelete(question)}
            icon="🗑️"
          >
            Excluir
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(question)}
            icon="✏️"
          >
            Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuestionsPage;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Table, { TableActions, TablePagination } from '../components/Table';
import Modal, { ConfirmModal, useConfirmModal } from '../components/Modal';
import Button from '../components/Button';
import { useExams } from '../hooks/useApi';
import './ExamsPage.css';

const ExamsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [filters, setFilters] = useState({
    status: ''
  });

  // Hook para gerenciar provas
  const {
    exams,
    pagination,
    isLoading,
    error,
    createExam,
    updateExam,
    deleteExam,
    generateQuestions,
    generatePDF,
    refetch,
    page,
    limit,
    goToPage,
    changeLimit,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useExams(1, 10, filters);

  // Modal de confirmação
  const { showConfirm, ConfirmModal: ConfirmModalComponent } = useConfirmModal();

  // Estatísticas das provas
  const stats = {
    total: pagination.total_items || 0,
    rascunho: exams.filter(e => e.status === 'rascunho').length,
    ativa: exams.filter(e => e.status === 'ativa').length,
    finalizada: exams.filter(e => e.status === 'finalizada').length
  };

  // Colunas da tabela
  const columns = [
    {
      key: 'titulo',
      title: 'Título',
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 'semibold' }}>{value}</div>
          {item.disciplina && (
            <div style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
              {item.disciplina}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge ${value?.toLowerCase() || 'rascunho'}`}>
          {value}
        </span>
      ),
      align: 'center'
    },
    {
      key: 'selected_questions',
      title: 'Questões',
      render: (value) => value?.length || 0,
      align: 'center'
    },
    {
      key: 'data_aplicacao',
      title: 'Data de Aplicação',
      type: 'date'
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
              onClick: () => handleViewExam(item),
              variant: 'primary'
            },
            {
              icon: '🎲',
              title: 'Gerar questões',
              onClick: () => handleGenerateQuestions(item),
              variant: 'primary',
              disabled: item.status === 'finalizada'
            },
            {
              icon: '📄',
              title: 'Gerar PDF',
              onClick: () => handleGeneratePDF(item),
              variant: 'primary',
              disabled: !item.selected_questions?.length
            },
            {
              icon: '✏️',
              title: 'Editar',
              onClick: () => handleEditExam(item),
              variant: 'primary',
              disabled: item.status === 'finalizada'
            },
            {
              icon: '🗑️',
              title: 'Excluir',
              onClick: () => handleDeleteExam(item),
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
  const handleCreateExam = () => {
    setSelectedExam(null);
    setIsCreateModalOpen(true);
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setIsCreateModalOpen(true);
  };

  const handleViewExam = (exam) => {
    setSelectedExam(exam);
    setIsDetailModalOpen(true);
  };

  const handleDeleteExam = (exam) => {
    showConfirm({
      title: 'Excluir Prova',
      message: 'Tem certeza que deseja excluir esta prova?',
      description: 'Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      confirmVariant: 'danger',
      icon: '🗑️',
      iconVariant: 'danger',
      onConfirm: async () => {
        await deleteExam.mutateAsync(exam.id);
      }
    });
  };

  const handleGenerateQuestions = (exam) => {
    setSelectedExam(exam);
    setIsGeneratorModalOpen(true);
  };

  const handleGeneratePDF = async (exam) => {
    try {
      await generatePDF.mutateAsync(exam.id);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
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
    <div className="exams-page">
      {/* Header */}
      <div className="exams-header">
        <h1 className="exams-title">Gerenciar Provas</h1>
        <div className="exams-actions">
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
            onClick={handleCreateExam}
          >
            Nova Prova
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="exams-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.rascunho}</div>
          <div className="stat-label">Rascunhos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.ativa}</div>
          <div className="stat-label">Ativas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.finalizada}</div>
          <div className="stat-label">Finalizadas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="questions-filters">
        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="rascunho">Rascunho</option>
            <option value="ativa">Ativa</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
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
          data={exams}
          columns={columns}
          loading={isLoading}
          error={error}
          pagination={paginationProps}
          emptyMessage="Nenhuma prova encontrada"
          emptyDescription="Crie sua primeira prova para começar"
          emptyIcon="📝"
        />
      </div>

      {/* Modal de Criação/Edição */}
      <ExamFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        exam={selectedExam}
        onSave={selectedExam ? updateExam : createExam}
      />

      {/* Modal de Detalhes */}
      <ExamDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        exam={selectedExam}
        onEdit={handleEditExam}
        onDelete={handleDeleteExam}
        onGenerateQuestions={handleGenerateQuestions}
        onGeneratePDF={handleGeneratePDF}
      />

      {/* Modal de Gerador de Questões */}
      <QuestionGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        exam={selectedExam}
        onGenerate={generateQuestions}
      />

      {/* Modal de Confirmação */}
      <ConfirmModalComponent />
    </div>
  );
};

// Modal de formulário de prova
const ExamFormModal = ({ isOpen, onClose, exam, onSave }) => {
  const isEditing = !!exam;
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      titulo: '',
      descricao: '',
      disciplina: '',
      data_aplicacao: '',
      duracao_minutos: 60,
      questions_config: {
        facil: 0,
        medio: 0,
        dificil: 0
      }
    }
  });

  const watchConfig = watch('questions_config');
  const totalQuestions = (watchConfig?.facil || 0) + (watchConfig?.medio || 0) + (watchConfig?.dificil || 0);

  // Resetar form quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (exam) {
        reset({
          titulo: exam.titulo,
          descricao: exam.descricao || '',
          disciplina: exam.disciplina || '',
          data_aplicacao: exam.data_aplicacao ? exam.data_aplicacao.split('T')[0] : '',
          duracao_minutos: exam.duracao_minutos || 60,
          questions_config: exam.questions_config || { facil: 0, medio: 0, dificil: 0 }
        });
      } else {
        reset({
          titulo: '',
          descricao: '',
          disciplina: '',
          data_aplicacao: '',
          duracao_minutos: 60,
          questions_config: { facil: 0, medio: 0, dificil: 0 }
        });
      }
    }
  }, [isOpen, exam, reset]);

  const onSubmit = async (data) => {
    try {
      const examData = {
        ...data,
        questions_config: {
          ...data.questions_config,
          total: totalQuestions
        }
      };

      if (isEditing) {
        await onSave.mutateAsync({ id: exam.id, data: examData });
      } else {
        await onSave.mutateAsync(examData);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar prova:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Prova' : 'Nova Prova'}
      size="lg"
      loading={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="exam-form">
        {/* Informações básicas */}
        <div className="form-group">
          <label className="form-label required">Título da Prova</label>
          <input
            type="text"
            className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
            placeholder="Digite o título da prova..."
            {...register('titulo', {
              required: 'Título é obrigatório',
              minLength: { value: 3, message: 'Mínimo de 3 caracteres' }
            })}
          />
          {errors.titulo && (
            <div className="invalid-feedback">{errors.titulo.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-control"
            placeholder="Descrição da prova (opcional)..."
            rows="3"
            {...register('descricao')}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Disciplina</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Matemática, História..."
              {...register('disciplina')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data de Aplicação</label>
            <input
              type="date"
              className="form-control"
              {...register('data_aplicacao')}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Duração (minutos)</label>
          <input
            type="number"
            className="form-control"
            min="1"
            max="600"
            {...register('duracao_minutos', {
              min: { value: 1, message: 'Mínimo 1 minuto' },
              max: { value: 600, message: 'Máximo 600 minutos' }
            })}
          />
          {errors.duracao_minutos && (
            <div className="invalid-feedback">{errors.duracao_minutos.message}</div>
          )}
        </div>

        {/* Configuração de questões */}
        <div className="questions-config-section">
          <h4 className="config-title">Configuração das Questões</h4>
          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">Questões Fáceis</label>
              <input
                type="number"
                className="config-input"
                min="0"
                {...register('questions_config.facil', {
                  min: { value: 0, message: 'Valor mínimo: 0' }
                })}
              />
            </div>

            <div className="config-item">
              <label className="config-label">Questões Médias</label>
              <input
                type="number"
                className="config-input"
                min="0"
                {...register('questions_config.medio', {
                  min: { value: 0, message: 'Valor mínimo: 0' }
                })}
              />
            </div>

            <div className="config-item">
              <label className="config-label">Questões Difíceis</label>
              <input
                type="number"
                className="config-input"
                min="0"
                {...register('questions_config.dificil', {
                  min: { value: 0, message: 'Valor mínimo: 0' }
                })}
              />
            </div>

            <div className="config-total">
              Total: {totalQuestions} questões
            </div>
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
            {isEditing ? 'Atualizar' : 'Criar'} Prova
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de detalhes da prova
const ExamDetailModal = ({ 
  isOpen, 
  onClose, 
  exam, 
  onEdit, 
  onDelete, 
  onGenerateQuestions, 
  onGeneratePDF 
}) => {
  if (!exam) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Prova"
      size="xl"
    >
      <div className="exam-detail">
        {/* Header */}
        <div className="exam-header-detail">
          <div className="exam-info">
            <h2>{exam.titulo}</h2>
            {exam.descricao && <p>{exam.descricao}</p>}
            <span className={`status-badge ${exam.status?.toLowerCase()}`}>
              {exam.status}
            </span>
          </div>
          <div className="exam-meta">
            {exam.disciplina && (
              <div className="meta-item">
                <span className="meta-label">Disciplina:</span>
                <span className="meta-value">{exam.disciplina}</span>
              </div>
            )}
            {exam.data_aplicacao && (
              <div className="meta-item">
                <span className="meta-label">Data:</span>
                <span className="meta-value">
                  {new Date(exam.data_aplicacao).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {exam.duracao_minutos && (
              <div className="meta-item">
                <span className="meta-label">Duração:</span>
                <span className="meta-value">{exam.duracao_minutos} min</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Questões:</span>
              <span className="meta-value">{exam.selected_questions?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="exam-actions-detail">
          <Button
            variant="primary"
            icon="🎲"
            onClick={() => onGenerateQuestions(exam)}
            disabled={exam.status === 'finalizada'}
          >
            Gerar Questões
          </Button>
          <Button
            variant="primary"
            icon="📄"
            onClick={() => onGeneratePDF(exam)}
            disabled={!exam.selected_questions?.length}
          >
            Gerar PDF
          </Button>
          <Button
            variant="outline-primary"
            icon="✏️"
            onClick={() => onEdit(exam)}
            disabled={exam.status === 'finalizada'}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            icon="🗑️"
            onClick={() => onDelete(exam)}
          >
            Excluir
          </Button>
        </div>

        {/* Questões */}
        {exam.selected_questions && exam.selected_questions.length > 0 && (
          <div className="exam-questions-detail">
            <div className="questions-header">
              <h3 className="questions-title">Questões da Prova</h3>
              <span className="questions-count">
                {exam.selected_questions.length} questões
              </span>
            </div>
            <div className="questions-list">
              {exam.questions?.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <div className="question-title">
                      Questão {index + 1}
                      <span className={`difficulty-badge ${question.nivel_dificuldade?.toLowerCase()}`}>
                        {question.nivel_dificuldade}
                      </span>
                    </div>
                  </div>
                  <div className="question-content">
                    {question.texto_questao}
                  </div>
                  <div className="question-alternatives">
                    {question.alternativas?.map((alt, altIndex) => (
                      <div
                        key={altIndex}
                        className={`alternative ${
                          String.fromCharCode(65 + altIndex) === question.resposta_correta 
                            ? 'correct' 
                            : ''
                        }`}
                      >
                        <span className="alternative-letter">
                          {String.fromCharCode(65 + altIndex)})
                        </span>
                        {alt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code se existir */}
        {exam.qr_code && (
          <div className="qr-code-section">
            <h4 className="qr-code-title">QR Code para Correção</h4>
            <div className="qr-code-image">
              {/* Aqui seria renderizado o QR Code */}
              <div style={{ width: 150, height: 150, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                QR Code
              </div>
            </div>
            <p className="qr-code-description">
              Use este QR Code para correção rápida no dispositivo móvel
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Modal de gerador de questões
const QuestionGeneratorModal = ({ isOpen, onClose, exam, onGenerate }) => {
  const [step, setStep] = useState(1);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!exam) return null;

  const config = exam.questions_config || {};
  const totalQuestions = (config.facil || 0) + (config.medio || 0) + (config.dificil || 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate.mutateAsync(exam.id);
      setGeneratedQuestions(result.questions || []);
      setStep(2);
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    onClose();
    setStep(1);
    setGeneratedQuestions([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerar Questões"
      size="lg"
    >
      <div className="exam-generator">
        {step === 1 && (
          <div className="generator-step">
            <h3 className="step-title">Configuração das Questões</h3>
            <p className="step-description">
              As questões serão selecionadas aleatoriamente do seu banco de questões
              baseado na configuração abaixo:
            </p>

            <div className="questions-summary">
              <div className="summary-item">
                <div className="summary-number">{config.facil || 0}</div>
                <div className="summary-label">Fáceis</div>
              </div>
              <div className="summary-item">
                <div className="summary-number">{config.medio || 0}</div>
                <div className="summary-label">Médias</div>
              </div>
              <div className="summary-item">
                <div className="summary-number">{config.dificil || 0}</div>
                <div className="summary-label">Difíceis</div>
              </div>
              <div className="summary-item">
                <div className="summary-number">{totalQuestions}</div>
                <div className="summary-label">Total</div>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={totalQuestions === 0}
              >
                Gerar Questões
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="generator-step">
            <h3 className="step-title">Questões Geradas</h3>
            <p className="step-description">
              {generatedQuestions.length} questões foram geradas com sucesso!
            </p>

            <div className="questions-preview">
              {generatedQuestions.map((question, index) => (
                <div key={question.id} className="question-item">
                  <div className="question-number">Questão {index + 1}</div>
                  <div className="question-text">{question.texto_questao}</div>
                  <div className="question-meta">
                    <span className={`difficulty-badge ${question.nivel_dificuldade?.toLowerCase()}`}>
                      {question.nivel_dificuldade}
                    </span>
                    <span>Resposta: {question.resposta_correta}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <Button
                variant="primary"
                onClick={handleConfirm}
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExamsPage;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Table, { TableActions, TablePagination } from '../components/Table';
import Modal, { ConfirmModal, useConfirmModal } from '../components/Modal';
import Button from '../components/Button';
import { useCorrections } from '../hooks/useApi';
import './CorrectionsPage.css';

const CorrectionsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    exam_id: ''
  });

  // Hook para gerenciar correções
  const {
    corrections,
    pagination,
    isLoading,
    error,
    createCorrection,
    correctExam,
    updateObservations,
    refetch,
    page,
    limit,
    goToPage,
    changeLimit,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useCorrections(1, 10, filters);

  // Modal de confirmação
  const { showConfirm, ConfirmModal: ConfirmModalComponent } = useConfirmModal();

  // Estatísticas das correções
  const stats = {
    total: pagination.total_items || 0,
    pendente: corrections.filter(c => c.status === 'pendente').length,
    corrigida: corrections.filter(c => c.status === 'corrigida').length,
    media: corrections.length > 0 
      ? (corrections.reduce((sum, c) => sum + (c.nota || 0), 0) / corrections.filter(c => c.nota).length).toFixed(1)
      : 0
  };

  // Colunas da tabela
  const columns = [
    {
      key: 'nome_aluno',
      title: 'Aluno',
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 'semibold' }}>{value}</div>
          {item.exam?.titulo && (
            <div style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
              {item.exam.titulo}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'nota',
      title: 'Nota',
      render: (value, item) => {
        if (item.status !== 'corrigida') return '-';
        
        const scoreClass = value >= 70 ? 'score-good' : value >= 50 ? 'score-average' : 'score-poor';
        const status = value >= 60 ? 'aprovado' : 'reprovado';
        
        return (
          <div className="score-display">
            <span className={`score-value ${scoreClass}`}>
              {value ? value.toFixed(1) : '0.0'}
            </span>
            <span className={`score-badge ${status}`}>
              {status}
            </span>
          </div>
        );
      },
      align: 'center'
    },
    {
      key: 'acertos',
      title: 'Acertos/Total',
      render: (value, item) => (
        item.status === 'corrigida' 
          ? `${item.acertos || 0}/${item.total_questoes || 0}`
          : '-'
      ),
      align: 'center'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span className={`status-badge ${value?.toLowerCase() || 'pendente'}`}>
          {value === 'pendente' ? 'Pendente' : 'Corrigida'}
        </span>
      ),
      align: 'center'
    },
    {
      key: 'created_at',
      title: 'Data',
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
              onClick: () => handleViewCorrection(item),
              variant: 'primary'
            },
            {
              icon: '✅',
              title: 'Corrigir',
              onClick: () => handleCorrectExam(item),
              variant: 'success',
              disabled: item.status === 'corrigida'
            },
            {
              icon: '📝',
              title: 'Observações',
              onClick: () => handleEditObservations(item),
              variant: 'primary'
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
  const handleCreateCorrection = () => {
    setSelectedCorrection(null);
    setIsCreateModalOpen(true);
  };

  const handleViewCorrection = (correction) => {
    setSelectedCorrection(correction);
    setIsDetailModalOpen(true);
  };

  const handleCorrectExam = async (correction) => {
    if (correction.status === 'corrigida') {
      toast.info('Esta prova já foi corrigida');
      return;
    }

    showConfirm({
      title: 'Corrigir Prova',
      message: 'Deseja corrigir automaticamente esta prova?',
      description: 'A correção será feita baseada no gabarito oficial.',
      confirmText: 'Corrigir',
      confirmVariant: 'success',
      icon: '✅',
      iconVariant: 'success',
      onConfirm: async () => {
        await correctExam.mutateAsync(correction.id);
      }
    });
  };

  const handleEditObservations = (correction) => {
    setSelectedCorrection(correction);
    // Aqui poderia abrir um modal específico para editar observações
    const observacoes = prompt('Observações:', correction.observacoes || '');
    if (observacoes !== null) {
      updateObservations.mutateAsync({
        id: correction.id,
        observations: observacoes
      });
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
    <div className="corrections-page">
      {/* Header */}
      <div className="corrections-header">
        <h1 className="corrections-title">Correções</h1>
        <div className="corrections-actions">
          <Link to="/scanner">
            <Button
              variant="outline-primary"
              icon="📱"
            >
              Scanner QR
            </Button>
          </Link>
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
            onClick={handleCreateCorrection}
          >
            Nova Correção
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="corrections-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendente}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.corrigida}</div>
          <div className="stat-label">Corrigidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.media}</div>
          <div className="stat-label">Média Geral</div>
        </div>
      </div>

      {/* QR Scanner Section */}
      <div className="qr-scanner-section">
        <div className="qr-scanner-icon">📱</div>
        <h3 className="qr-scanner-title">Correção por QR Code</h3>
        <p className="qr-scanner-description">
          Use o scanner de QR Code para corrigir provas rapidamente através do seu dispositivo móvel
        </p>
        <Link to="/scanner">
          <Button variant="primary" icon="📱">
            Abrir Scanner
          </Button>
        </Link>
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
            <option value="pendente">Pendente</option>
            <option value="corrigida">Corrigida</option>
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
          data={corrections}
          columns={columns}
          loading={isLoading}
          error={error}
          pagination={paginationProps}
          emptyMessage="Nenhuma correção encontrada"
          emptyDescription="As correções aparecerão aqui após criar respostas de alunos"
          emptyIcon="✅"
        />
      </div>

      {/* Modal de Criação */}
      <CorrectionFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createCorrection}
      />

      {/* Modal de Detalhes */}
      <CorrectionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        correction={selectedCorrection}
        onCorrect={handleCorrectExam}
      />

      {/* Modal de Confirmação */}
      <ConfirmModalComponent />
    </div>
  );
};

// Modal de formulário de correção
const CorrectionFormModal = ({ isOpen, onClose, onSave }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [answers, setAnswers] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      exam_id: '',
      nome_aluno: '',
      tempo_resposta_minutos: '',
      observacoes: ''
    }
  });

  const watchExamId = watch('exam_id');

  // Simular busca de prova (em implementação real, faria uma requisição)
  useEffect(() => {
    if (watchExamId) {
      // Aqui buscaria a prova selecionada
      setSelectedExam({
        id: watchExamId,
        titulo: 'Prova Exemplo',
        total_questoes: 10
      });
      setAnswers({});
    } else {
      setSelectedExam(null);
      setAnswers({});
    }
  }, [watchExamId]);

  const onSubmit = async (data) => {
    try {
      const correctionData = {
        ...data,
        respostas: answers
      };

      await onSave.mutateAsync(correctionData);
      onClose();
      reset();
      setAnswers({});
    } catch (error) {
      console.error('Erro ao salvar correção:', error);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Correção Manual"
      size="lg"
      loading={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="correction-form">
        {/* Informações do aluno */}
        <div className="student-info-section">
          <h4>Informações do Aluno</h4>
          
          <div className="form-group">
            <label className="form-label required">Prova</label>
            <select
              className={`form-control ${errors.exam_id ? 'is-invalid' : ''}`}
              {...register('exam_id', { required: 'Selecione uma prova' })}
            >
              <option value="">Selecione uma prova...</option>
              <option value="1">Prova de Matemática - Básico</option>
              <option value="2">Prova de História - Medieval</option>
            </select>
            {errors.exam_id && (
              <div className="invalid-feedback">{errors.exam_id.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label required">Nome do Aluno</label>
            <input
              type="text"
              className={`form-control ${errors.nome_aluno ? 'is-invalid' : ''}`}
              placeholder="Digite o nome completo do aluno"
              {...register('nome_aluno', {
                required: 'Nome do aluno é obrigatório',
                minLength: { value: 2, message: 'Mínimo de 2 caracteres' }
              })}
            />
            {errors.nome_aluno && (
              <div className="invalid-feedback">{errors.nome_aluno.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tempo de Resposta (minutos)</label>
            <input
              type="number"
              className="form-control"
              min="1"
              placeholder="Ex: 60"
              {...register('tempo_resposta_minutos')}
            />
          </div>
        </div>

        {/* Respostas */}
        {selectedExam && (
          <div className="answers-section">
            <h4 className="answers-title">
              Respostas ({selectedExam.total_questoes} questões)
            </h4>
            <div className="answers-grid">
              {Array.from({ length: selectedExam.total_questoes }, (_, index) => (
                <div key={index} className="answer-item">
                  <div className="question-number">Q{index + 1}</div>
                  <div className="answer-options">
                    {['A', 'B', 'C', 'D', 'E'].map(option => (
                      <div
                        key={option}
                        className={`answer-option ${
                          answers[index + 1] === option ? 'selected' : ''
                        }`}
                        onClick={() => handleAnswerChange(index + 1, option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="form-group">
          <label className="form-label">Observações</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Observações sobre a prova (opcional)"
            {...register('observacoes')}
          />
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
            disabled={!selectedExam}
          >
            Salvar Correção
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de detalhes da correção
const CorrectionDetailModal = ({ isOpen, onClose, correction, onCorrect }) => {
  if (!correction) return null;

  const approvalStatus = correction.nota >= 60 ? 'Aprovado' : 'Reprovado';
  const scoreClass = correction.nota >= 70 ? 'score-good' : 
                    correction.nota >= 50 ? 'score-average' : 'score-poor';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Correção"
      size="xl"
    >
      <div className="correction-detail">
        {/* Header */}
        <div className="correction-header">
          <div className="student-info">
            <h2>{correction.nome_aluno}</h2>
            <p>{correction.exam?.titulo}</p>
            {correction.status === 'corrigida' && (
              <span className={`score-badge ${approvalStatus.toLowerCase()}`}>
                {approvalStatus}
              </span>
            )}
          </div>
          <div className="correction-summary">
            <div className="summary-item">
              <span className="summary-label">Status:</span>
              <span className="summary-value">
                {correction.status === 'corrigida' ? 'Corrigida' : 'Pendente'}
              </span>
            </div>
            {correction.status === 'corrigida' && (
              <>
                <div className="summary-item">
                  <span className="summary-label">Acertos:</span>
                  <span className="summary-value">
                    {correction.acertos}/{correction.total_questoes}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Percentual:</span>
                  <span className="summary-value">
                    {((correction.acertos / correction.total_questoes) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="final-score">
                  <div className={`score-value ${scoreClass}`}>
                    {correction.nota.toFixed(1)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detalhes das questões */}
        {correction.detalhes_correcao && (
          <div className="correction-details">
            <div className="details-header">
              <h3 className="details-title">Detalhes por Questão</h3>
            </div>
            <div className="details-content">
              {Object.entries(correction.detalhes_correcao).map(([questionId, details]) => (
                <div key={questionId} className="question-detail">
                  <div className="question-header-detail">
                    <div className="question-title-detail">
                      Questão {details.numero_questao}
                    </div>
                    <div className={`answer-status ${details.correto ? 'correct' : 'incorrect'}`}>
                      {details.correto ? '✅ Correto' : '❌ Incorreto'}
                    </div>
                  </div>
                  <div className="answer-comparison">
                    <div className="answer-info">
                      <div className="answer-label">Resposta do Aluno</div>
                      <div className={`answer-value student ${details.correto ? 'correct' : 'incorrect'}`}>
                        {details.resposta_aluno}
                      </div>
                    </div>
                    <div className="answer-info">
                      <div className="answer-label">Resposta Correta</div>
                      <div className="answer-value correct">
                        {details.resposta_correta}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        {correction.observacoes && (
          <div className="form-group">
            <label className="form-label">Observações</label>
            <div className="form-control" style={{ minHeight: '60px', background: 'var(--light)' }}>
              {correction.observacoes}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="modal-footer">
          {correction.status === 'pendente' && (
            <Button
              variant="success"
              icon="✅"
              onClick={() => onCorrect(correction)}
            >
              Corrigir Automaticamente
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CorrectionsPage;
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useApi';
import Button from '../components/Button';
import Loading, { SkeletonCard } from '../components/Loading';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  
  // Carregar estatísticas
  const { data: questionStats, isLoading: loadingQuestions } = useStats('questions');
  const { data: examStats, isLoading: loadingExams } = useStats('exams');
  const { data: correctionStats, isLoading: loadingCorrections } = useStats('corrections');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const quickActions = [
    {
      title: 'Nova Questão',
      description: 'Adicionar questão ao banco',
      icon: '➕',
      path: '/questoes',
      variant: 'success'
    },
    {
      title: 'Criar Prova',
      description: 'Gerar nova prova',
      icon: '📝',
      path: '/provas',
      variant: 'primary'
    },
    {
      title: 'Scanner QR',
      description: 'Corrigir por QR Code',
      icon: '📱',
      path: '/scanner',
      variant: 'info'
    },
    {
      title: 'Ver Correções',
      description: 'Resultados das provas',
      icon: '📊',
      path: '/correcoes',
      variant: 'warning'
    }
  ];

  const recentActivities = [
    {
      type: 'question',
      action: 'Nova questão criada',
      subject: 'Matemática - Equações',
      time: '2 horas atrás',
      icon: '❓'
    },
    {
      type: 'exam',
      action: 'Prova gerada',
      subject: 'Avaliação Bimestral',
      time: '1 dia atrás',
      icon: '📝'
    },
    {
      type: 'correction',
      action: 'Prova corrigida',
      subject: '15 alunos avaliados',
      time: '2 dias atrás',
      icon: '✅'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Professor'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Bem-vindo ao seu painel de controle do Sistema de Provas
          </p>
        </div>
        
        <div className="user-summary">
          <div className="user-info-card">
            <h3>Suas informações</h3>
            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">Nome:</span>
                <span className="detail-value">{user?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              {user?.institution && (
                <div className="detail-item">
                  <span className="detail-label">Instituição:</span>
                  <span className="detail-value">{user.institution}</span>
                </div>
              )}
              {user?.subject && (
                <div className="detail-item">
                  <span className="detail-label">Disciplina:</span>
                  <span className="detail-value">{user.subject}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <h2 className="section-title">Estatísticas Gerais</h2>
        <div className="stats-grid">
          {/* Questions Stats */}
          <div className="stats-card">
            {loadingQuestions ? (
              <SkeletonCard hasImage={false} />
            ) : (
              <>
                <div className="stats-card-header">
                  <div className="stats-icon questions-icon">❓</div>
                  <div className="stats-info">
                    <h3>Questões</h3>
                    <div className="stats-value">
                      {questionStats?.total_questions || 0}
                    </div>
                  </div>
                </div>
                <div className="stats-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Fáceis:</span>
                    <span className="breakdown-value">
                      {questionStats?.by_difficulty?.['Fácil'] || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Médias:</span>
                    <span className="breakdown-value">
                      {questionStats?.by_difficulty?.['Médio'] || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Difíceis:</span>
                    <span className="breakdown-value">
                      {questionStats?.by_difficulty?.['Difícil'] || 0}
                    </span>
                  </div>
                </div>
                <Link to="/questoes" className="stats-link">
                  Ver todas as questões →
                </Link>
              </>
            )}
          </div>

          {/* Exams Stats */}
          <div className="stats-card">
            {loadingExams ? (
              <SkeletonCard hasImage={false} />
            ) : (
              <>
                <div className="stats-card-header">
                  <div className="stats-icon exams-icon">📝</div>
                  <div className="stats-info">
                    <h3>Provas</h3>
                    <div className="stats-value">
                      {examStats?.total_exams || 0}
                    </div>
                  </div>
                </div>
                <div className="stats-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Ativas:</span>
                    <span className="breakdown-value">
                      {examStats?.by_status?.ativa || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Rascunhos:</span>
                    <span className="breakdown-value">
                      {examStats?.by_status?.rascunho || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Finalizadas:</span>
                    <span className="breakdown-value">
                      {examStats?.by_status?.finalizada || 0}
                    </span>
                  </div>
                </div>
                <Link to="/provas" className="stats-link">
                  Ver todas as provas →
                </Link>
              </>
            )}
          </div>

          {/* Corrections Stats */}
          <div className="stats-card">
            {loadingCorrections ? (
              <SkeletonCard hasImage={false} />
            ) : (
              <>
                <div className="stats-card-header">
                  <div className="stats-icon corrections-icon">✅</div>
                  <div className="stats-info">
                    <h3>Correções</h3>
                    <div className="stats-value">
                      {correctionStats?.total_corrections || 0}
                    </div>
                  </div>
                </div>
                <div className="stats-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Pendentes:</span>
                    <span className="breakdown-value">
                      {correctionStats?.by_status?.pendente || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Corrigidas:</span>
                    <span className="breakdown-value">
                      {correctionStats?.by_status?.corrigida || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Média geral:</span>
                    <span className="breakdown-value">
                      {correctionStats?.average_score ? 
                        `${correctionStats.average_score.toFixed(1)}%` : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                <Link to="/correcoes" className="stats-link">
                  Ver todas as correções →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2 className="section-title">Ações Rápidas</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`action-card action-${action.variant}`}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-activity">
        <h2 className="section-title">Atividades Recentes</h2>
        <div className="activity-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-subject">{activity.subject}</div>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))
          ) : (
            <div className="empty-activity">
              <div className="empty-icon">📋</div>
              <p>Nenhuma atividade recente</p>
              <p className="empty-description">
                Suas ações no sistema aparecerão aqui
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started */}
      <div className="dashboard-help">
        <div className="help-card">
          <h3>Primeiros Passos</h3>
          <p>Novo no sistema? Siga estes passos para começar:</p>
          <ol className="help-steps">
            <li>Crie algumas questões no banco de questões</li>
            <li>Configure e gere sua primeira prova</li>
            <li>Use o scanner QR para corrigir rapidamente</li>
            <li>Acompanhe os resultados no painel de correções</li>
          </ol>
          <Button variant="outline-primary" size="sm">
            Ver tutorial completo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
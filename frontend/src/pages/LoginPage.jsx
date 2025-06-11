import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Loading from '../components/Loading';
import './LoginPage.css';

const LoginPage = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm();

  const password = watch('password');

  // Reset form when switching modes
  useEffect(() => {
    reset();
  }, [isRegisterMode, reset]);

  const onSubmit = async (data) => {
    try {
      if (isRegisterMode) {
        const result = await register({
          name: data.name,
          email: data.email,
          password: data.password,
          institution: data.institution || '',
          subject: data.subject || '',
        });

        if (result.success) {
          navigate('/dashboard');
        }
      } else {
        const result = await login(data.email, data.password, rememberMe);

        if (result.success) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    reset();
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const strengthMap = {
      0: { label: '', color: '' },
      1: { label: 'Muito fraca', color: '#dc3545' },
      2: { label: 'Fraca', color: '#fd7e14' },
      3: { label: 'Média', color: '#ffc107' },
      4: { label: 'Forte', color: '#20c997' },
      5: { label: 'Muito forte', color: '#28a745' },
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(password);

  if (isLoading) {
    return (
      <div className="login-loading">
        <Loading size="lg" text="Verificando autenticação..." />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side - Welcome */}
        <div className="login-welcome">
          <div className="welcome-content">
            <div className="welcome-logo">
              <span className="welcome-icon">🎓</span>
              <h1 className="welcome-title">Sistema de Provas</h1>
            </div>
            
            <div className="welcome-features">
              <h2>Simplifique a criação e correção de provas</h2>
              <ul className="features-list">
                <li>
                  <span className="feature-icon">✨</span>
                  <div>
                    <strong>Banco de Questões</strong>
                    <p>Organize suas questões por categorias e dificuldade</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">📝</span>
                  <div>
                    <strong>Geração de Provas</strong>
                    <p>Crie provas personalizadas em PDF automaticamente</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">📱</span>
                  <div>
                    <strong>Correção por QR Code</strong>
                    <p>Corrija provas rapidamente usando seu celular</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">📊</span>
                  <div>
                    <strong>Relatórios Detalhados</strong>
                    <p>Acompanhe o desempenho dos alunos com estatísticas</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2 className="form-title">
                {isRegisterMode ? 'Criar conta' : 'Fazer login'}
              </h2>
              <p className="form-subtitle">
                {isRegisterMode 
                  ? 'Preencha os dados para criar sua conta'
                  : 'Entre com suas credenciais para acessar o sistema'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              {/* Name field - only in register mode */}
              {isRegisterMode && (
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Digite seu nome completo"
                    {...registerField('name', {
                      required: 'Nome é obrigatório',
                      minLength: {
                        value: 2,
                        message: 'Nome deve ter pelo menos 2 caracteres'
                      }
                    })}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name.message}</div>
                  )}
                </div>
              )}

              {/* Email field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label required">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Digite seu email"
                  autoComplete="email"
                  {...registerField('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email inválido'
                    }
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              {/* Password field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label required">
                  Senha
                </label>
                <div className="input-group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Digite sua senha"
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                    {...registerField('password', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 6,
                        message: 'Senha deve ter pelo menos 6 caracteres'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="input-group-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
                
                {/* Password strength indicator - only in register mode */}
                {isRegisterMode && password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </div>
                    <span
                      className="strength-label"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password - only in register mode */}
              {isRegisterMode && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label required">
                    Confirmar senha
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirme sua senha"
                    autoComplete="new-password"
                    {...registerField('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: (value) => 
                        value === password || 'Senhas não conferem'
                    })}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                  )}
                </div>
              )}

              {/* Additional fields for register */}
              {isRegisterMode && (
                <>
                  <div className="form-group">
                    <label htmlFor="institution" className="form-label">
                      Instituição
                    </label>
                    <input
                      id="institution"
                      type="text"
                      className="form-control"
                      placeholder="Nome da sua instituição (opcional)"
                      {...registerField('institution')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Disciplina
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className="form-control"
                      placeholder="Disciplina que leciona (opcional)"
                      {...registerField('subject')}
                    />
                  </div>
                </>
              )}

              {/* Remember me - only in login mode */}
              {!isRegisterMode && (
                <div className="form-group">
                  <div className="form-check">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="form-check-input"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe" className="form-check-label">
                      Lembrar de mim
                    </label>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isRegisterMode ? 'Criar conta' : 'Entrar'}
              </Button>

              {/* Forgot password link - only in login mode */}
              {!isRegisterMode && (
                <div className="form-footer">
                  <Link to="/forgot-password" className="forgot-link">
                    Esqueceu sua senha?
                  </Link>
                </div>
              )}
            </form>

            {/* Toggle mode */}
            <div className="login-toggle">
              <p>
                {isRegisterMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleMode}
                  disabled={isSubmitting}
                >
                  {isRegisterMode ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </div>

            {/* Demo credentials - only in development */}
            {process.env.NODE_ENV === 'development' && !isRegisterMode && (
              <div className="demo-credentials">
                <h4>Credenciais para demonstração:</h4>
                <p>
                  <strong>Email:</strong> professor@exemplo.com<br />
                  <strong>Senha:</strong> 123456
                </p>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    reset({
                      email: 'professor@exemplo.com',
                      password: '123456'
                    });
                  }}
                >
                  Preencher dados demo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
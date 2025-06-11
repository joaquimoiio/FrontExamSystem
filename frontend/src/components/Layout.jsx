import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Visão geral do sistema'
    },
    {
      path: '/questoes',
      label: 'Questões',
      icon: '❓',
      description: 'Gerenciar banco de questões'
    },
    {
      path: '/provas',
      label: 'Provas',
      icon: '📝',
      description: 'Criar e gerenciar provas'
    },
    {
      path: '/correcoes',
      label: 'Correções',
      icon: '✅',
      description: 'Corrigir e avaliar provas'
    },
    {
      path: '/scanner',
      label: 'Scanner QR',
      icon: '📱',
      description: 'Escanear QR codes'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-content">
          {/* Menu toggle button */}
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Logo */}
          <div className="header-logo">
            <Link to="/dashboard" className="logo-link">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">Sistema de Provas</span>
            </Link>
          </div>

          {/* User menu */}
          <div className="header-user">
            <div className="user-info">
              <div className="user-avatar">
                {getUserInitials()}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || 'Usuário'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleLogout}
              icon="🚪"
              title="Sair"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`layout-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <nav className="sidebar-nav">
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActiveRoute(item.path) ? 'nav-link-active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info in sidebar */}
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {getUserInitials()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Usuário'}</div>
              {user?.institution && (
                <div className="sidebar-user-institution">{user.institution}</div>
              )}
              {user?.subject && (
                <div className="sidebar-user-subject">{user.subject}</div>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="layout-main">
          <div className="main-content">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="layout-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span>© 2024 Sistema de Provas</span>
            <span className="footer-separator">•</span>
            <span>Versão 1.0.0</span>
          </div>
          <div className="footer-links">
            <button
              type="button"
              className="footer-link"
              onClick={() => window.open('/help', '_blank')}
            >
              Ajuda
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => window.open('/privacy', '_blank')}
            >
              Privacidade
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
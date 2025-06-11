import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  outline = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const fullWidthClass = fullWidth ? 'btn-block' : '';
  const disabledClass = (disabled || loading) ? 'disabled' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <span className="btn-spinner" />;
    }
    if (icon) {
      return <span className="btn-icon">{icon}</span>;
    }
    return null;
  };

  const renderContent = () => {
    if (loading && !children) {
      return 'Carregando...';
    }

    if (!icon && !loading) {
      return children;
    }

    const iconElement = renderIcon();
    const hasText = !!children;

    if (!hasText) {
      return iconElement;
    }

    if (iconPosition === 'right') {
      return (
        <>
          <span className="btn-text">{children}</span>
          {iconElement}
        </>
      );
    }

    return (
      <>
        {iconElement}
        <span className="btn-text">{children}</span>
      </>
    );
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Componente específico para botões de ação
export const ActionButton = ({ 
  action = 'save', 
  children, 
  ...props 
}) => {
  const actionConfig = {
    save: { variant: 'primary', icon: '💾' },
    cancel: { variant: 'secondary', icon: '✕' },
    delete: { variant: 'danger', icon: '🗑️' },
    edit: { variant: 'warning', icon: '✏️' },
    view: { variant: 'info', icon: '👁️' },
    add: { variant: 'success', icon: '➕' },
    download: { variant: 'primary', icon: '⬇️' },
    upload: { variant: 'primary', icon: '⬆️' },
    search: { variant: 'primary', icon: '🔍' },
    filter: { variant: 'secondary', icon: '🔽' },
    refresh: { variant: 'secondary', icon: '🔄' },
    back: { variant: 'secondary', icon: '←' },
    next: { variant: 'primary', icon: '→' },
    print: { variant: 'secondary', icon: '🖨️' },
  };

  const config = actionConfig[action] || actionConfig.save;

  return (
    <Button {...config} {...props}>
      {children}
    </Button>
  );
};

// Grupo de botões
export const ButtonGroup = ({ 
  children, 
  size = 'md',
  vertical = false,
  className = '',
  ...props 
}) => {
  const groupClass = vertical ? 'btn-group-vertical' : 'btn-group';
  const sizeClass = size !== 'md' ? `btn-group-${size}` : '';
  
  const classes = [groupClass, sizeClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" {...props}>
      {children}
    </div>
  );
};

// Toolbar de botões
export const ButtonToolbar = ({ 
  children, 
  className = '',
  justify = false,
  ...props 
}) => {
  const classes = [
    'btn-toolbar',
    justify ? 'justify-content-between' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="toolbar" {...props}>
      {children}
    </div>
  );
};

export default Button;
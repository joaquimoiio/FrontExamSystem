import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import './Modal.css';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  fullscreen = false,
  showHeader = true,
  showFooter = false,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footerActions,
  className = '',
  animate = true,
  loading = false,
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  // Gerenciar foco e scroll do body
  useEffect(() => {
    if (isOpen) {
      // Salvar elemento com foco atual
      previousFocus.current = document.activeElement;
      
      // Prevenir scroll do body
      document.body.classList.add('modal-open');
      
      // Focar no modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restaurar scroll do body
      document.body.classList.remove('modal-open');
      
      // Restaurar foco anterior
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Gerenciar foco dentro do modal
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const sizeClass = size !== 'md' ? `modal-${size}` : '';
  const fullscreenClass = fullscreen ? 'modal-fullscreen' : '';
  const animateClass = animate ? 'modal-animate-slide' : '';
  const loadingClass = loading ? 'modal-loading' : '';

  const modalClasses = [
    'modal',
    isOpen ? 'modal-open' : '',
    sizeClass,
    fullscreenClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const dialogClasses = [
    'modal-dialog',
    animateClass
  ].filter(Boolean).join(' ');

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={modalClasses}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      {...props}
    >
      <div
        ref={modalRef}
        className={dialogClasses}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {showHeader && (title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Fechar modal"
                disabled={loading}
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="modal-body">
          {children}
        </div>

        {showFooter && footerActions && (
          <div className="modal-footer">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar no portal
  return createPortal(modalContent, document.body);
};

// Modal de confirmação
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  icon = '❓',
  iconVariant = 'info',
  loading = false,
  ...props
}) => {
  const footerActions = (
    <>
      <Button
        variant={cancelVariant}
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        loading={loading}
        disabled={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showFooter={true}
      footerActions={footerActions}
      className="modal-confirm"
      loading={loading}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      {...props}
    >
      <div className="modal-body">
        <div className={`modal-icon ${iconVariant}`}>
          {icon}
        </div>
        {message && <div className="modal-message">{message}</div>}
        {description && <div className="modal-description">{description}</div>}
      </div>
    </Modal>
  );
};

// Modal de alerta
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Aviso',
  message,
  description,
  buttonText = 'OK',
  buttonVariant = 'primary',
  icon = 'ℹ️',
  iconVariant = 'info',
  ...props
}) => {
  const footerActions = (
    <Button
      variant={buttonVariant}
      onClick={onClose}
    >
      {buttonText}
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showFooter={true}
      footerActions={footerActions}
      className="modal-confirm"
      {...props}
    >
      <div className="modal-body">
        <div className={`modal-icon ${iconVariant}`}>
          {icon}
        </div>
        {message && <div className="modal-message">{message}</div>}
        {description && <div className="modal-description">{description}</div>}
      </div>
    </Modal>
  );
};

// Hook para controlar modais
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};

// Hook para confirmação
export const useConfirmModal = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {},
    loading: false,
  });

  const showConfirm = React.useCallback((options) => {
    setModalState({
      isOpen: true,
      title: options.title || 'Confirmação',
      message: options.message || '',
      description: options.description || '',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      confirmVariant: options.confirmVariant || 'primary',
      cancelVariant: options.cancelVariant || 'secondary',
      icon: options.icon || '❓',
      iconVariant: options.iconVariant || 'info',
      onConfirm: options.onConfirm || (() => {}),
      onCancel: options.onCancel || (() => {}),
      loading: false,
    });
  }, []);

  const hideConfirm = React.useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = React.useCallback(async () => {
    setModalState(prev => ({ ...prev, loading: true }));
    
    try {
      await modalState.onConfirm();
      hideConfirm();
    } catch (error) {
      console.error('Erro na confirmação:', error);
    } finally {
      setModalState(prev => ({ ...prev, loading: false }));
    }
  }, [modalState.onConfirm, hideConfirm]);

  const handleCancel = React.useCallback(() => {
    modalState.onCancel();
    hideConfirm();
  }, [modalState.onCancel, hideConfirm]);

  const ConfirmModalComponent = React.useCallback(() => (
    <ConfirmModal
      isOpen={modalState.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={modalState.title}
      message={modalState.message}
      description={modalState.description}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      confirmVariant={modalState.confirmVariant}
      cancelVariant={modalState.cancelVariant}
      icon={modalState.icon}
      iconVariant={modalState.iconVariant}
      loading={modalState.loading}
    />
  ), [modalState, handleConfirm, handleCancel]);

  return {
    showConfirm,
    hideConfirm,
    ConfirmModal: ConfirmModalComponent,
  };
};

export default Modal;
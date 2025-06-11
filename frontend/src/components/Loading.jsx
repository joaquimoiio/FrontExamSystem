import React from 'react';
import './Loading.css';

const Loading = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  overlay = false,
  text = '',
  className = '',
  ...props
}) => {
  const sizeClass = `loading-${size}`;
  const variantClass = `loading-${variant}`;
  const classes = ['loading-spinner', sizeClass, variantClass, className].filter(Boolean).join(' ');

  const LoadingSpinner = () => (
    <div className={classes} {...props}>
      <div className="loading-circle"></div>
    </div>
  );

  const LoadingContent = () => (
    <div className="loading-content">
      <LoadingSpinner />
      {text && <div className="loading-text">{text}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <LoadingContent />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        <LoadingContent />
      </div>
    );
  }

  if (text) {
    return <LoadingContent />;
  }

  return <LoadingSpinner />;
};

// Componente de esqueleto para carregamento
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = true,
  className = '',
  ...props
}) => {
  const variantClass = `skeleton-${variant}`;
  const animationClass = animation ? 'skeleton-animated' : '';
  const classes = ['skeleton', variantClass, animationClass, className].filter(Boolean).join(' ');

  const style = {
    width,
    height,
  };

  return <div className={classes} style={style} {...props} />;
};

// Grupo de esqueletos
export const SkeletonGroup = ({ children, className = '', ...props }) => {
  return (
    <div className={`skeleton-group ${className}`} {...props}>
      {children}
    </div>
  );
};

// Esqueletos pré-configurados
export const SkeletonText = ({ lines = 1, className = '', ...props }) => {
  const skeletons = Array.from({ length: lines }, (_, index) => (
    <Skeleton
      key={index}
      variant="text"
      width={index === lines - 1 ? '60%' : '100%'}
      className="mb-2"
      {...props}
    />
  ));

  return (
    <SkeletonGroup className={className}>
      {skeletons}
    </SkeletonGroup>
  );
};

export const SkeletonCard = ({ hasImage = true, hasTitle = true, hasText = true, className = '', ...props }) => {
  return (
    <SkeletonGroup className={`skeleton-card ${className}`} {...props}>
      {hasImage && (
        <Skeleton
          variant="rect"
          width="100%"
          height="200px"
          className="mb-3"
        />
      )}
      {hasTitle && (
        <Skeleton
          variant="text"
          width="70%"
          height="1.5rem"
          className="mb-2"
        />
      )}
      {hasText && (
        <SkeletonText lines={3} />
      )}
    </SkeletonGroup>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4, hasHeader = true, className = '', ...props }) => {
  return (
    <SkeletonGroup className={`skeleton-table ${className}`} {...props}>
      {hasHeader && (
        <div className="skeleton-table-header mb-3">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton
              key={`header-${index}`}
              variant="text"
              width="100%"
              height="1.2rem"
              className="skeleton-table-cell"
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="skeleton-table-row mb-2">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={colIndex === 0 ? '60%' : '100%'}
              height="1rem"
              className="skeleton-table-cell"
            />
          ))}
        </div>
      ))}
    </SkeletonGroup>
  );
};

export const SkeletonAvatar = ({ size = 'md', className = '', ...props }) => {
  const sizeMap = {
    xs: '24px',
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '96px',
  };

  return (
    <Skeleton
      variant="circle"
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
      {...props}
    />
  );
};

export const SkeletonButton = ({ width = '120px', className = '', ...props }) => {
  return (
    <Skeleton
      variant="rect"
      width={width}
      height="40px"
      className={`skeleton-button ${className}`}
      {...props}
    />
  );
};

// Componente de loading inline
export const InlineLoading = ({ text = 'Carregando...', className = '', ...props }) => {
  return (
    <div className={`inline-loading ${className}`} {...props}>
      <Loading size="sm" />
      <span className="inline-loading-text">{text}</span>
    </div>
  );
};

// Componente de loading para botões
export const ButtonLoading = ({ size = 'sm', className = '', ...props }) => {
  return (
    <Loading
      size={size}
      className={`button-loading ${className}`}
      {...props}
    />
  );
};

// Estados de carregamento específicos
export const PageLoading = ({ title = 'Carregando página...', className = '', ...props }) => {
  return (
    <div className={`page-loading ${className}`} {...props}>
      <div className="page-loading-content">
        <Loading size="lg" />
        <h3 className="page-loading-title">{title}</h3>
        <div className="page-loading-skeleton">
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
};

export const TableLoading = ({ rows = 5, columns = 4, className = '', ...props }) => {
  return (
    <div className={`table-loading ${className}`} {...props}>
      <SkeletonTable rows={rows} columns={columns} />
    </div>
  );
};

export const CardLoading = ({ count = 3, className = '', ...props }) => {
  return (
    <div className={`card-loading ${className}`} {...props}>
      <div className="card-loading-grid">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

// Loading com progresso
export const ProgressLoading = ({
  progress = 0,
  text = 'Processando...',
  showPercentage = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`progress-loading ${className}`} {...props}>
      <div className="progress-loading-content">
        <Loading size="lg" />
        <div className="progress-loading-text">
          {text}
          {showPercentage && (
            <span className="progress-loading-percentage">
              {Math.round(progress)}%
            </span>
          )}
        </div>
        <div className="progress-loading-bar">
          <div
            className="progress-loading-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Loading para formulários
export const FormLoading = ({ fields = 3, className = '', ...props }) => {
  return (
    <div className={`form-loading ${className}`} {...props}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="form-loading-field mb-4">
          <Skeleton variant="text" width="30%" height="1rem" className="mb-2" />
          <Skeleton variant="rect" width="100%" height="40px" />
        </div>
      ))}
      <div className="form-loading-actions">
        <SkeletonButton width="100px" />
        <SkeletonButton width="80px" />
      </div>
    </div>
  );
};

// Loading com retry
export const ErrorLoading = ({
  error = 'Erro ao carregar',
  onRetry,
  retryText = 'Tentar novamente',
  className = '',
  ...props
}) => {
  return (
    <div className={`error-loading ${className}`} {...props}>
      <div className="error-loading-content">
        <div className="error-loading-icon">❌</div>
        <div className="error-loading-message">{error}</div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onRetry}
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

// Hook para loading state
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const toggleLoading = React.useCallback(() => {
    setIsLoading(prev => !prev);
  }, []);

  const withLoading = React.useCallback(async (asyncFn) => {
    try {
      startLoading();
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
};

export default Loading;
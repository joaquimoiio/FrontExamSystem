import React, { useState, useMemo, useCallback } from 'react';
import Button from './Button';
import Loading from './Loading';
import './Table.css';

const Table = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  title,
  searchable = true,
  sortable = true,
  selectable = false,
  striped = true,
  hover = true,
  size = 'md',
  responsive = true,
  emptyMessage = 'Nenhum item encontrado',
  emptyDescription = 'Não há dados para exibir',
  emptyIcon = '📋',
  onRowClick,
  onSort,
  onSearch,
  onSelect,
  onSelectAll,
  selectedRows = [],
  actions,
  bulkActions,
  filters,
  pagination,
  className = '',
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filtrar dados baseado na busca
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return data;

    return data.filter(item => {
      return columns.some(column => {
        const value = getNestedValue(item, column.key);
        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, searchable]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, sortable]);

  // Função para obter valor aninhado
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => value && value[key], obj);
  };

  // Lidar com busca
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  }, [onSearch]);

  // Lidar com ordenação
  const handleSort = useCallback((key) => {
    if (!sortable) return;

    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key, direction };
    
    setSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig);
    }
  }, [sortConfig, sortable, onSort]);

  // Lidar com seleção de linha
  const handleRowSelect = useCallback((item, checked) => {
    if (onSelect) {
      onSelect(item, checked);
    }
  }, [onSelect]);

  // Lidar com seleção de todas as linhas
  const handleSelectAll = useCallback((checked) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  }, [onSelectAll]);

  // Renderizar célula
  const renderCell = useCallback((item, column) => {
    const value = getNestedValue(item, column.key);

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('pt-BR');
    }

    if (column.type === 'datetime' && value) {
      return new Date(value).toLocaleString('pt-BR');
    }

    if (column.type === 'currency' && typeof value === 'number') {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }

    if (column.type === 'status') {
      return (
        <span className={`table-status status-${value?.toLowerCase() || 'inactive'}`}>
          {value || 'N/A'}
        </span>
      );
    }

    return value || '-';
  }, []);

  // Classes da tabela
  const tableClasses = [
    'table',
    size !== 'md' ? `table-${size}` : '',
    striped ? 'table-striped' : '',
    hover ? 'table-hover' : '',
    sortable ? 'table-sortable' : '',
    selectable ? 'table-selectable' : '',
    className
  ].filter(Boolean).join(' ');

  // Verificar se todas as linhas estão selecionadas
  const isAllSelected = selectable && selectedRows.length === sortedData.length && sortedData.length > 0;
  const isIndeterminate = selectable && selectedRows.length > 0 && selectedRows.length < sortedData.length;

  if (error) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <div className="table-empty-icon">❌</div>
          <div className="table-empty-message">Erro ao carregar dados</div>
          <div className="table-empty-description">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${loading ? 'table-loading' : ''}`} {...props}>
      {/* Header */}
      {(title || searchable || actions) && (
        <div className="table-header">
          {title && <h3 className="table-title">{title}</h3>}
          <div className="table-actions">
            {searchable && (
              <div className="table-search">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Filters */}
      {filters && (
        <div className="table-filters">
          {filters}
        </div>
      )}

      {/* Bulk Actions */}
      {selectable && selectedRows.length > 0 && bulkActions && (
        <div className="table-bulk-actions">
          <div className="table-bulk-message">
            {selectedRows.length} item(ns) selecionado(s)
          </div>
          {bulkActions}
        </div>
      )}

      {/* Table */}
      <div className={responsive ? 'table-responsive' : ''}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {selectable && (
                <th className="table-select-all">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    column.sortable !== false && sortable ? 'sortable' : '',
                    column.align ? `table-cell-${column.align}` : '',
                    sortConfig.key === column.key ? `table-sort-${sortConfig.direction}` : ''
                  ].filter(Boolean).join(' ')}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  {column.title}
                  {column.sortable !== false && sortable && (
                    <span className="table-sort-icon">
                      {sortConfig.key === column.key ? 
                        (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'
                      }
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <div className="table-empty">
                    <div className="table-empty-icon">{emptyIcon}</div>
                    <div className="table-empty-message">{emptyMessage}</div>
                    <div className="table-empty-description">{emptyDescription}</div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const isSelected = selectedRows.some(row => 
                  row.id ? row.id === item.id : row === item
                );

                return (
                  <tr
                    key={item.id || index}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {selectable && (
                      <td className="table-select-all">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(item, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={[
                          column.align ? `table-cell-${column.align}` : '',
                          column.nowrap ? 'table-cell-nowrap' : '',
                          column.ellipsis ? 'table-cell-ellipsis' : ''
                        ].filter(Boolean).join(' ')}
                        data-label={column.title}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="table-pagination">
          <div className="table-pagination-info">
            {pagination.info}
          </div>
          <div className="table-pagination-controls">
            {pagination.controls}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && <Loading overlay />}
    </div>
  );
};

// Componente de ações de linha
export const TableActions = ({ actions = [], item }) => {
  return (
    <div className="table-row-actions">
      {actions.map((action, index) => (
        <button
          key={index}
          type="button"
          className={`table-action-btn ${action.variant || ''}`}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          title={action.title}
          disabled={action.disabled}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

// Componente de paginação
export const TablePagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showSizeSelector = true,
  sizeOptions = [10, 25, 50, 100]
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const info = totalItems > 0 
    ? `Mostrando ${startItem} a ${endItem} de ${totalItems} itens`
    : 'Nenhum item encontrado';

  const controls = (
    <>
      {showSizeSelector && (
        <div className="table-pagination-controls">
          <label htmlFor="items-per-page">Itens por página:</label>
          <select
            id="items-per-page"
            className="table-pagination-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          >
            {sizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      <div className="table-pagination-controls">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>

        <span style={{ padding: '0 1rem' }}>
          Página {currentPage} de {totalPages}
        </span>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Próxima
        </Button>
      </div>
    </>
  );

  return { info, controls };
};

// Hook para gerenciar estado da tabela
export const useTable = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSelect = useCallback((item, checked) => {
    setSelectedRows(prev => {
      if (checked) {
        return [...prev, item];
      } else {
        return prev.filter(row => row.id !== item.id);
      }
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedRows([...data]);
    } else {
      setSelectedRows([]);
    }
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const updateData = useCallback((newData) => {
    setData(newData);
    setError(null);
  }, []);

  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    selectedRows,
    currentPage,
    itemsPerPage,
    setData: updateData,
    setLoading: setLoadingState,
    setError: setErrorState,
    handleSelect,
    handleSelectAll,
    clearSelection,
    setCurrentPage,
    setItemsPerPage,
  };
};

export default Table;
import { useState, useEffect, useRef, useCallback } from 'react';
import qrCodeService from '../services/qrcode';
import { toast } from 'react-hot-toast';

// Hook principal para scanner de QR Code
export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const scannerRef = useRef(null);
  const elementIdRef = useRef(null);

  // Verificar suporte ao scanner
  useEffect(() => {
    const checkSupport = async () => {
      const supportInfo = qrCodeService.getSupportInfo();
      setIsSupported(supportInfo.isSupported);
      
      if (!supportInfo.isSupported) {
        if (!supportInfo.requirements.https) {
          setError('Scanner QR requer HTTPS ou localhost');
        } else if (!supportInfo.requirements.getUserMedia) {
          setError('Navegador não suporta acesso à câmera');
        } else {
          setError('Scanner QR não suportado');
        }
      }
    };

    checkSupport();
  }, []);

  // Carregar câmeras disponíveis
  const loadCameras = useCallback(async () => {
    try {
      if (!isSupported) return;

      const deviceList = await qrCodeService.getCameras();
      setCameras(deviceList);
      
      if (deviceList.length > 0 && !selectedCamera) {
        // Selecionar câmera traseira por padrão ou a primeira disponível
        const rearCamera = deviceList.find(camera => 
          camera.label.toLowerCase().includes('back') ||
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(rearCamera?.id || deviceList[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar câmeras:', error);
      setError('Erro ao acessar câmeras');
    }
  }, [isSupported, selectedCamera]);

  // Solicitar permissão de câmera
  const requestPermission = useCallback(async () => {
    try {
      const granted = await qrCodeService.requestCameraPermission();
      setHasPermission(granted);
      
      if (granted) {
        await loadCameras();
      } else {
        setError('Permissão de câmera negada');
      }
      
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setHasPermission(false);
      setError('Erro ao solicitar permissão de câmera');
      return false;
    }
  }, [loadCameras]);

  // Iniciar escaneamento
  const startScanning = useCallback(async (elementId, onSuccess, config = {}) => {
    try {
      if (!isSupported) {
        throw new Error('Scanner não suportado');
      }

      if (isScanning) {
        await stopScanning();
      }

      elementIdRef.current = elementId;
      setError(null);

      // Solicitar permissão se necessário
      if (hasPermission === null) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permissão de câmera necessária');
        }
      }

      const onScanSuccess = (data, result) => {
        setError(null);
        onSuccess(data, result);
      };

      const onScanError = (error) => {
        if (!error.includes('NotFoundException')) {
          setError(`Erro no scanner: ${error}`);
        }
      };

      if (selectedCamera) {
        await qrCodeService.startScanningWithCamera(
          elementId,
          selectedCamera,
          onScanSuccess,
          onScanError,
          config
        );
      } else {
        await qrCodeService.startScanning(
          elementId,
          onScanSuccess,
          onScanError,
          config
        );
      }

      setIsScanning(true);
      scannerRef.current = qrCodeService.scanner;
    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      setError(error.message);
      setIsScanning(false);
      throw error;
    }
  }, [isSupported, isScanning, hasPermission, selectedCamera, requestPermission]);

  // Parar escaneamento
  const stopScanning = useCallback(async () => {
    try {
      await qrCodeService.stopScanner();
      setIsScanning(false);
      scannerRef.current = null;
    } catch (error) {
      console.error('Erro ao parar scanner:', error);
    }
  }, []);

  // Trocar câmera
  const switchCamera = useCallback(async (cameraId) => {
    setSelectedCamera(cameraId);
    
    if (isScanning && elementIdRef.current) {
      // Reiniciar scanner com nova câmera
      const elementId = elementIdRef.current;
      await stopScanning();
      
      // Pequeno delay para garantir que o scanner foi parado
      setTimeout(() => {
        if (elementIdRef.current === elementId) {
          // Usar a última configuração de sucesso
          // Nota: Isso requer armazenar as últimas callbacks
        }
      }, 100);
    }
  }, [isScanning, stopScanning]);

  // Escanear arquivo
  const scanFile = useCallback(async (file) => {
    try {
      const result = await qrCodeService.scanFile(file);
      return result;
    } catch (error) {
      setError('Não foi possível ler o QR Code da imagem');
      throw error;
    }
  }, []);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (isScanning) {
        qrCodeService.stopScanner().catch(console.error);
      }
    };
  }, [isScanning]);

  return {
    // Estado
    isScanning,
    isSupported,
    hasPermission,
    error,
    cameras,
    selectedCamera,
    
    // Ações
    startScanning,
    stopScanning,
    switchCamera,
    scanFile,
    requestPermission,
    loadCameras,
    
    // Utilitários
    clearError: () => setError(null),
  };
};

// Hook simplificado para escaneamento único
export const useSimpleQRScanner = () => {
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const startScan = useCallback(async (elementId) => {
    try {
      setIsScanning(true);
      setError(null);
      setResult(null);

      await qrCodeService.startScanning(
        elementId,
        (data) => {
          setResult(data);
          setIsScanning(false);
          qrCodeService.stopScanner();
        },
        (error) => {
          if (!error.includes('NotFoundException')) {
            setError(error);
          }
        }
      );
    } catch (error) {
      setError(error.message);
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(async () => {
    await qrCodeService.stopScanner();
    setIsScanning(false);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isScanning,
    error,
    startScan,
    stopScan,
    reset,
  };
};

// Hook para escaneamento contínuo
export const useContinuousQRScanner = (cooldown = 2000) => {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const addScannedCode = useCallback((data, result) => {
    const timestamp = Date.now();
    setScannedCodes(prev => [{
      data,
      result,
      timestamp,
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    }, ...prev]);
  }, []);

  const startContinuousScan = useCallback(async (elementId) => {
    try {
      setIsScanning(true);
      setError(null);

      await qrCodeService.startContinuousScanning(
        elementId,
        addScannedCode,
        { cooldown }
      );
    } catch (error) {
      setError(error.message);
      setIsScanning(false);
    }
  }, [addScannedCode, cooldown]);

  const stopScan = useCallback(async () => {
    await qrCodeService.stopScanner();
    setIsScanning(false);
  }, []);

  const clearHistory = useCallback(() => {
    setScannedCodes([]);
  }, []);

  return {
    scannedCodes,
    isScanning,
    error,
    startContinuousScan,
    stopScan,
    clearHistory,
  };
};

// Hook para validação de QR Code de prova
export const useExamQRValidator = () => {
  const validateQRCode = useCallback((qrData) => {
    return qrCodeService.validateExamQRCode(qrData);
  }, []);

  const validateAndProcess = useCallback(async (qrData, onValid, onInvalid) => {
    try {
      const validation = validateQRCode(qrData);
      
      if (validation.valid) {
        if (onValid) {
          await onValid(validation);
        }
        return validation;
      } else {
        if (onInvalid) {
          onInvalid(validation);
        }
        
        if (validation.warning) {
          toast.error(validation.error);
        } else {
          toast.error(validation.error);
        }
        
        return validation;
      }
    } catch (error) {
      const errorValidation = { 
        valid: false, 
        error: 'Erro ao processar QR Code' 
      };
      
      if (onInvalid) {
        onInvalid(errorValidation);
      }
      
      toast.error(errorValidation.error);
      return errorValidation;
    }
  }, [validateQRCode]);

  return {
    validateQRCode,
    validateAndProcess,
  };
};

// Hook para upload e scan de imagem
export const useQRImageScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scanImage = useCallback(async (file) => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      // Validar arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou GIF.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Máximo 5MB.');
      }

      const result = await qrCodeService.scanFile(file);
      setResult(result);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    scanImage,
    isProcessing,
    result,
    error,
    reset,
  };
};

// Hook para configurações de scanner
export const useQRScannerConfig = () => {
  const [config, setConfig] = useState({
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false,
    videoConstraints: {
      facingMode: 'environment',
    },
  });

  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      videoConstraints: {
        facingMode: 'environment',
      },
    });
  }, []);

  const getPreset = useCallback((preset) => {
    const presets = {
      default: {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      fast: {
        fps: 20,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
      },
      precise: {
        fps: 5,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
      },
      mobile: {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
    };

    return presets[preset] || presets.default;
  }, []);

  const applyPreset = useCallback((preset) => {
    const presetConfig = getPreset(preset);
    updateConfig(presetConfig);
  }, [getPreset, updateConfig]);

  return {
    config,
    updateConfig,
    resetConfig,
    getPreset,
    applyPreset,
  };
};

// Hook para histórico de scans
export const useQRScanHistory = (maxItems = 50) => {
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((data, metadata = {}) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      type: typeof data === 'string' ? 'text' : 'object',
      ...metadata,
    };

    setHistory(prev => {
      const newHistory = [item, ...prev];
      return newHistory.slice(0, maxItems);
    });

    return item;
  }, [maxItems]);

  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getHistoryByType = useCallback((type) => {
    return history.filter(item => item.type === type);
  }, [history]);

  const searchHistory = useCallback((searchTerm) => {
    if (!searchTerm) return history;

    return history.filter(item => {
      const dataStr = typeof item.data === 'string' 
        ? item.data 
        : JSON.stringify(item.data);
      
      return dataStr.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [history]);

  const exportHistory = useCallback(() => {
    const exportData = {
      exported_at: new Date().toISOString(),
      count: history.length,
      items: history,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-scan-history-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryByType,
    searchHistory,
    exportHistory,
    count: history.length,
  };
};

// Hook para estatísticas de scan
export const useQRScanStats = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    averageScanTime: 0,
    lastScanTime: null,
    scansByType: {},
  });

  const recordScan = useCallback((success, scanTime = null, dataType = 'unknown') => {
    setStats(prev => {
      const newStats = {
        ...prev,
        totalScans: prev.totalScans + 1,
        successfulScans: success ? prev.successfulScans + 1 : prev.successfulScans,
        failedScans: success ? prev.failedScans : prev.failedScans + 1,
        lastScanTime: Date.now(),
        scansByType: {
          ...prev.scansByType,
          [dataType]: (prev.scansByType[dataType] || 0) + 1,
        },
      };

      if (scanTime && success) {
        const totalTime = prev.averageScanTime * prev.successfulScans;
        newStats.averageScanTime = (totalTime + scanTime) / newStats.successfulScans;
      }

      return newStats;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      averageScanTime: 0,
      lastScanTime: null,
      scansByType: {},
    });
  }, []);

  const getSuccessRate = useCallback(() => {
    if (stats.totalScans === 0) return 0;
    return (stats.successfulScans / stats.totalScans) * 100;
  }, [stats]);

  const getFailureRate = useCallback(() => {
    if (stats.totalScans === 0) return 0;
    return (stats.failedScans / stats.totalScans) * 100;
  }, [stats]);

  return {
    stats,
    recordScan,
    resetStats,
    getSuccessRate,
    getFailureRate,
  };
};

export default {
  useQRScanner,
  useSimpleQRScanner,
  useContinuousQRScanner,
  useExamQRValidator,
  useQRImageScanner,
  useQRScannerConfig,
  useQRScanHistory,
  useQRScanStats,
};
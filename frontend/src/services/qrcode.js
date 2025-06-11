import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';

// Configurações padrão do scanner
const DEFAULT_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
  videoConstraints: {
    facingMode: 'environment', // Câmera traseira
  },
};

export const qrCodeService = {
  // Scanner básico
  scanner: null,
  isScanning: false,

  // Inicializar scanner
  async initScanner(elementId, config = {}) {
    try {
      if (this.scanner) {
        await this.stopScanner();
      }

      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      
      this.scanner = new Html5QrcodeScanner(elementId, finalConfig, false);
      
      return this.scanner;
    } catch (error) {
      console.error('Erro ao inicializar scanner:', error);
      throw new Error('Falha ao inicializar scanner de QR Code');
    }
  },

  // Iniciar escaneamento
  async startScanning(elementId, onSuccess, onError = null, config = {}) {
    try {
      if (this.isScanning) {
        await this.stopScanner();
      }

      await this.initScanner(elementId, config);
      
      const successCallback = (decodedText, decodedResult) => {
        this.isScanning = true;
        
        try {
          // Tentar fazer parse do JSON
          const data = JSON.parse(decodedText);
          onSuccess(data, decodedResult);
        } catch (parseError) {
          // Se não for JSON válido, retornar o texto bruto
          onSuccess(decodedText, decodedResult);
        }
      };

      const errorCallback = (error) => {
        // Não mostrar erros de escaneamento contínuo
        if (!error.includes('NotFoundException')) {
          console.warn('Erro no scanner:', error);
          if (onError) {
            onError(error);
          }
        }
      };

      this.scanner.render(successCallback, errorCallback);
      this.isScanning = true;

      return true;
    } catch (error) {
      console.error('Erro ao iniciar escaneamento:', error);
      toast.error('Erro ao acessar a câmera. Verifique as permissões.');
      throw error;
    }
  },

  // Parar scanner
  async stopScanner() {
    try {
      if (this.scanner) {
        await this.scanner.clear();
        this.scanner = null;
      }
      this.isScanning = false;
      
      return true;
    } catch (error) {
      console.error('Erro ao parar scanner:', error);
      return false;
    }
  },

  // Verificar suporte a câmera
  async checkCameraSupport() {
    try {
      const devices = await Html5Qrcode.getCameras();
      return devices.length > 0;
    } catch (error) {
      console.error('Erro ao verificar câmeras:', error);
      return false;
    }
  },

  // Obter câmeras disponíveis
  async getCameras() {
    try {
      const devices = await Html5Qrcode.getCameras();
      return devices.map(device => ({
        id: device.id,
        label: device.label || `Câmera ${device.id}`,
      }));
    } catch (error) {
      console.error('Erro ao obter câmeras:', error);
      return [];
    }
  },

  // Scanner com câmera específica
  async startScanningWithCamera(elementId, cameraId, onSuccess, onError = null, config = {}) {
    try {
      if (this.scanner) {
        await this.stopScanner();
      }

      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      this.scanner = new Html5Qrcode(elementId);

      const successCallback = (decodedText, decodedResult) => {
        try {
          const data = JSON.parse(decodedText);
          onSuccess(data, decodedResult);
        } catch (parseError) {
          onSuccess(decodedText, decodedResult);
        }
      };

      const errorCallback = (error) => {
        if (!error.includes('NotFoundException')) {
          console.warn('Erro no scanner:', error);
          if (onError) {
            onError(error);
          }
        }
      };

      await this.scanner.start(cameraId, finalConfig, successCallback, errorCallback);
      this.isScanning = true;

      return true;
    } catch (error) {
      console.error('Erro ao iniciar scanner com câmera específica:', error);
      toast.error('Erro ao acessar a câmera selecionada.');
      throw error;
    }
  },

  // Escanear arquivo de imagem
  async scanFile(file) {
    try {
      const scanner = new Html5Qrcode('temp-qr-scanner');
      
      const result = await scanner.scanFile(file, true);
      
      try {
        // Tentar fazer parse do JSON
        return JSON.parse(result);
      } catch (parseError) {
        // Se não for JSON, retornar texto bruto
        return result;
      }
    } catch (error) {
      console.error('Erro ao escanear arquivo:', error);
      throw new Error('Não foi possível ler o QR Code da imagem');
    }
  },

  // Validar QR Code de prova
  validateExamQRCode(qrData) {
    try {
      // Se for string, tentar fazer parse
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      // Verificações básicas
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'QR Code inválido' };
      }

      if (!data.exam_id) {
        return { valid: false, error: 'ID da prova não encontrado' };
      }

      if (data.type && data.type !== 'exam') {
        return { valid: false, error: 'QR Code não é de uma prova' };
      }

      // Verificar timestamp se existir
      if (data.timestamp) {
        const qrDate = new Date(data.timestamp);
        const now = new Date();
        const diffDays = (now - qrDate) / (1000 * 60 * 60 * 24);
        
        // QR Code muito antigo (mais de 30 dias)
        if (diffDays > 30) {
          return { 
            valid: false, 
            error: 'QR Code expirado',
            warning: true 
          };
        }
      }

      return {
        valid: true,
        examId: data.exam_id,
        version: data.version || 1,
        timestamp: data.timestamp,
      };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Formato de QR Code inválido' 
      };
    }
  },

  // Gerar dados para QR Code de prova
  generateExamQRData(examId, version = 1) {
    return JSON.stringify({
      type: 'exam',
      exam_id: examId,
      version,
      timestamp: Date.now(),
    });
  },

  // Gerar dados para QR Code de correção
  generateCorrectionQRData(examId, answerId, studentName) {
    return JSON.stringify({
      type: 'correction',
      exam_id: examId,
      answer_id: answerId,
      student_name: studentName,
      timestamp: Date.now(),
    });
  },

  // Utilitários para permissões de câmera
  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      // Parar o stream imediatamente, só queríamos testar a permissão
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão da câmera:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Acesso à câmera negado. Verifique as configurações do navegador.');
      } else if (error.name === 'NotFoundError') {
        toast.error('Nenhuma câmera encontrada.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Câmera não suportada neste navegador.');
      } else {
        toast.error('Erro ao acessar a câmera.');
      }
      
      return false;
    }
  },

  // Verificar se o navegador suporta getUserMedia
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  // Obter informações sobre suporte
  getSupportInfo() {
    const hasMediaDevices = !!(navigator.mediaDevices);
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

    return {
      hasMediaDevices,
      hasGetUserMedia,
      isSecureContext,
      isLocalhost,
      isSupported: hasGetUserMedia && (isSecureContext || isLocalhost),
      requirements: {
        https: isSecureContext || isLocalhost,
        mediaDevices: hasMediaDevices,
        getUserMedia: hasGetUserMedia,
      }
    };
  },

  // Scanner contínuo para múltiplos QR codes
  startContinuousScanning(elementId, onScan, config = {}) {
    const scannedCodes = new Set();
    let lastScanTime = 0;
    const scanCooldown = config.cooldown || 2000; // 2 segundos entre scans do mesmo código

    const onSuccess = (decodedText, decodedResult) => {
      const now = Date.now();
      const codeHash = this.hashCode(decodedText);
      
      // Verificar cooldown
      if (now - lastScanTime < scanCooldown && scannedCodes.has(codeHash)) {
        return;
      }

      scannedCodes.add(codeHash);
      lastScanTime = now;

      // Limpar códigos antigos após um tempo
      setTimeout(() => {
        scannedCodes.delete(codeHash);
      }, scanCooldown * 2);

      onScan(decodedText, decodedResult);
    };

    return this.startScanning(elementId, onSuccess, null, config);
  },

  // Gerar hash simples para string
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  },

  // Cleanup ao sair da página
  cleanup() {
    if (this.scanner) {
      this.stopScanner();
    }
  },

  // Event listeners para limpeza automática
  setupAutoCleanup() {
    // Cleanup quando a página é fechada
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Cleanup quando o componente é desmontado (para React)
    window.addEventListener('popstate', () => {
      this.cleanup();
    });

    // Cleanup em mudanças de visibilidade
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isScanning) {
        this.stopScanner();
      }
    });
  }
};

// Configurar cleanup automático
qrCodeService.setupAutoCleanup();

export default qrCodeService;
import { AccidentPredictionModel } from '../ml/accidentModel';

export class RiskPredictor {
  constructor() {
    this.accidentModel = null;
    this.isInitialized = false;
    this.currentRiskLevel = 0;
    this.riskHistory = [];
    this.config = {
      updateInterval: 5000, // 5 secondes
      maxHistory: 100,
      riskThresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
      }
    };
  }

  async initialize() {
    console.log('🚀 Initialisation du système de prédiction...');
    
    try {
      this.accidentModel = new AccidentPredictionModel();
      
      const modelReady = await this.accidentModel.initializeModel();
      const stats = this.accidentModel.getModelStats();
      
      console.log(`🤖 Modèle ML ${modelReady ? 'prêt' : 'en attente'} - ${stats.samplesCount} ${stats.dataSource}`);
      
      this.isInitialized = true;
      
      // Débogage
      console.log('🔍 Statut modèle:', this.accidentModel.getModelStats()); // ✅

      
      return this.isInitialized;
    } catch (error) {
      console.error('❌ Erreur initialisation ML:', error);
      // Même en cas d'erreur, on marque comme initialisé avec le fallback
      this.isInitialized = true;
      return true;
    }
  }

  async calculateRisk(sensorData) {
    if (!this.isInitialized || !this.accidentModel) {
      console.warn('⚠️ Prédicteur non initialisé');
      return this.getFallbackRisk();
    }
    
    try {
      // Extraction des features pour le modèle
      const features = this.extractFeatures(sensorData);
      
      console.log('📊 Calcul du risque avec features:', features);
      
      // Prédiction du risque
      const riskProbability = await this.accidentModel.predict(features);
      
      // Mise à jour de l'historique
      this.updateRiskHistory(riskProbability, sensorData);
      
      // Détermination du niveau de risque
      const riskLevel = this.determineRiskLevel(riskProbability);
      
      this.currentRiskLevel = riskProbability;
      
      console.log(`🎯 Risque calculé: ${(riskProbability * 100).toFixed(1)}% (${riskLevel})`);
      
      return {
        probability: riskProbability,
        level: riskLevel,
        features: features,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erreur calcul risque:', error);
      return this.getFallbackRisk(sensorData);
    }
  }

  extractFeatures(sensorData) {
    // Extraction et transformation des données capteurs en features
    const hour = new Date().getHours(); // Heure actuelle
    
    return [
      sensorData.temperature || 20,      // °C
      sensorData.humidity || 50,         // %
      sensorData.speed || 0,             // km/h (utilisé comme windSpeed)
      sensorData.visibility || 10,       // km (valeur par défaut)
      hour                               // 0-23
    ];
  }

  determineRiskLevel(probability) {
    const { riskThresholds } = this.config;
    
    if (probability < riskThresholds.low) {
      return 'low';
    } else if (probability < riskThresholds.medium) {
      return 'medium';
    } else if (probability < riskThresholds.high) {
      return 'high';
    } else {
      return 'very_high';
    }
  }

  updateRiskHistory(riskProbability, sensorData) {
    const riskEntry = {
      probability: riskProbability,
      level: this.determineRiskLevel(riskProbability),
      timestamp: new Date().toISOString(),
      sensorData: { ...sensorData }
    };
    
    this.riskHistory.unshift(riskEntry);
    
    // Garder seulement les N dernières entrées
    if (this.riskHistory.length > this.config.maxHistory) {
      this.riskHistory = this.riskHistory.slice(0, this.config.maxHistory);
    }
  }

  getFallbackRisk(sensorData = {}) {
    // Calcul basique en cas d'erreur
    const hour = new Date().getHours();
    const basicFeatures = [
      sensorData.temperature || 20,
      sensorData.humidity || 50,
      sensorData.speed || 0,
      10, // visibilité par défaut
      hour
    ];
    
    const basicRisk = this.accidentModel?.basicPrediction(basicFeatures) || 0.15;
    
    return {
      probability: basicRisk,
      level: this.determineRiskLevel(basicRisk),
      features: basicFeatures,
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }

  getRiskHistory() {
    return {
      current: this.currentRiskLevel,
      history: this.riskHistory,
      stats: this.calculateRiskStats()
    };
  }

  calculateRiskStats() {
    if (this.riskHistory.length === 0) return {};
    
    const probabilities = this.riskHistory.map(entry => entry.probability);
    const average = probabilities.reduce((a, b) => a + b, 0) / probabilities.length;
    const max = Math.max(...probabilities);
    const min = Math.min(...probabilities);
    
    return {
      average: average,
      max: max,
      min: min,
      trend: this.calculateTrend(),
      totalRecords: this.riskHistory.length
    };
  }

  calculateTrend() {
    if (this.riskHistory.length < 2) return 'stable';
    
    const recent = this.riskHistory.slice(0, 5);
    const older = this.riskHistory.slice(5, 10);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b.probability, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.probability, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  async retrainModel() {
    if (!this.accidentModel) {
      console.error('❌ Modèle non disponible pour ré-entraînement');
      return false;
    }
    
    try {
      console.log('🔄 Lancement du ré-entraînement...');
      await this.accidentModel.retrainModel();
      console.log('✅ Ré-entraînement terminé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur ré-entraînement:', error);
      return false;
    }
  }

  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      model: this.accidentModel ? this.accidentModel.getModelStats() : null,
      currentRisk: this.currentRiskLevel,
      historySize: this.riskHistory.length,
      config: this.config
    };
  }
}
export class CSVProcessor {
  constructor() {
    this.csvData = null;
    this.datasetStats = {
      totalSamples: 0,
      features: ['temperature', 'humidity', 'windSpeed', 'visibility', 'hour'],
      description: 'Données d\'accidents US',
      source: 'csv'
    };
  }

  async loadRealDataset() {
    console.log('🔍 [DIAGNOSTIC] Début du chargement CSV...');
    
    try {
      const response = await fetch('/data/US_Accidents_March23.csv');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('🔍 [DIAGNOSTIC] Statut HTTP:', response.status);
      
      const csvText = await response.text();
      console.log('🔍 [DIAGNOSTIC] Taille CSV:', csvText.length, 'caractères');
      
      const parsedData = this.parseCSV(csvText);
      console.log('🔍 [DIAGNOSTIC] Données parsées:', parsedData.length, 'lignes');
      
      this.csvData = parsedData;
      this.datasetStats.totalSamples = parsedData.length;
      
      return parsedData;
      
    } catch (error) {
      console.error('❌ [ERREUR] Échec CSV:', error);
      console.log('🔄 [SECOURS] Données simulées...');
      return this.generateFallbackData();
    }
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      throw new Error('CSV vide ou mal formaté');
    }
    
    const data = [];
    
    // Ignorer l'en-tête et parser les lignes
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const row = this.parseCSVLine(line);
      
      if (row && row.length >= 6) {
        // Convertir les strings en nombres
        const numericRow = row.map(value => {
          const num = parseFloat(value);
          return isNaN(num) ? 0 : num;
        });
        
        data.push(numericRow);
      }
    }
    
    console.log(`📊 ${data.length} lignes valides parsées`);
    return data;
  }

  parseCSVLine(line) {
    // Gestion des virgules dans les champs
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  generateFallbackData() {
    console.log('🔄 Chargement données de secours...');
    
    const fallbackData = [];
    
    // Génération de données de secours réalistes
    for (let i = 0; i < 100; i++) {
      const temperature = 15 + Math.random() * 25; // 15-40°C
      const humidity = 30 + Math.random() * 60; // 30-90%
      const windSpeed = Math.random() * 35; // 0-35 km/h
      const visibility = 1 + Math.random() * 14; // 1-15 km
      const hour = Math.floor(Math.random() * 24);
      
      // Détermination réaliste des accidents
      let accidentProbability = 0.1; // 10% de base
      
      if (temperature > 35) accidentProbability += 0.2;
      if (humidity > 80) accidentProbability += 0.15;
      if (windSpeed > 25) accidentProbability += 0.1;
      if (visibility < 3) accidentProbability += 0.25;
      if (hour >= 16 && hour <= 19) accidentProbability += 0.2;
      
      const hasAccident = Math.random() < accidentProbability ? 1 : 0;
      
      fallbackData.push([temperature, humidity, windSpeed, visibility, hour, hasAccident]);
    }
    
    this.csvData = fallbackData;
    this.datasetStats.totalSamples = fallbackData.length;
    this.datasetStats.source = 'fallback_simulated';
    
    console.log(`📊 ${fallbackData.length} données de secours générées`);
    
    return fallbackData;
  }

  getDatasetStats() {
    return {
      ...this.datasetStats,
      dataPoints: this.csvData ? this.csvData.length : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  getSampleData(count = 5) {
    if (!this.csvData || this.csvData.length === 0) {
      return [];
    }
    
    return this.csvData.slice(0, Math.min(count, this.csvData.length));
  }

  clearCache() {
    this.csvData = null;
    this.datasetStats.totalSamples = 0;
    console.log('🗑️ Cache CSV vidé');
  }
}
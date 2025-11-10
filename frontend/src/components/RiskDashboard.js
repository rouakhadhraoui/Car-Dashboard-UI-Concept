// frontend/src/components/RiskDashboard.js
import React from 'react';
import { AlertTriangle, Activity, TrendingUp, Cpu, RefreshCw } from 'lucide-react';

const RiskDashboard = ({ riskPrediction, vehicleData, mlStatus, onRetrainModel }) => {
  const { probability, level, features, timestamp, isFallback } = riskPrediction || {};

  // Fonction pour obtenir la couleur selon le niveau de risque
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'from-green-500 to-green-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'very_high': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Fonction pour obtenir le texte selon le niveau de risque
  const getRiskText = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'Risque Faible';
      case 'medium': return 'Risque Moyen';
      case 'high': return 'Risque Élevé';
      case 'very_high': return 'Risque Très Élevé';
      default: return 'Calcul en cours...';
    }
  };

  // Fonction pour obtenir les recommandations
  const getRecommendations = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return [
          '✅ Conduite sécuritaire',
          '✅ Conditions optimales',
          '✅ Maintenir la vigilance'
        ];
      case 'medium':
        return [
          '⚠️ Augmenter la distance de sécurité',
          '⚠️ Réduire légèrement la vitesse',
          '⚠️ Vérifier les conditions météo'
        ];
      case 'high':
        return [
          '🚨 Réduire la vitesse immédiatement',
          '🚨 Éviter les manœuvres brusques',
          '🚨 Chercher un endroit sécurisé'
        ];
      case 'very_high':
        return [
          '🔴 ARRÊTER le véhicule si possible',
          '🔴 Conditions extrêmement dangereuses',
          '🔴 Contacter les secours si nécessaire'
        ];
      default:
        return ['Chargement des recommandations...'];
    }
  };

  // Jauge de risque circulaire
  const RiskGauge = ({ percentage, level }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-64 h-64 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {/* Cercle de fond */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="#1f2937"
            strokeWidth="16"
            fill="none"
            opacity="0.3"
          />
          {/* Cercle de progression */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`text-${getRiskColor(level).split('-')[1]}-500 transition-all duration-1000`}
            style={{ 
              filter: `drop-shadow(0 0 10px ${getRiskColor(level).split('-')[1] === 'red' ? '#ef4444' : 
                getRiskColor(level).split('-')[1] === 'orange' ? '#f97316' : 
                getRiskColor(level).split('-')[1] === 'yellow' ? '#eab308' : '#22c55e'})` 
            }}
          />
        </svg>
        
        {/* Texte au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={`text-4xl font-bold ${
            level === 'very_high' ? 'text-red-500' :
            level === 'high' ? 'text-orange-500' :
            level === 'medium' ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {probability ? (probability * 100).toFixed(1) : '0'}%
          </div>
          <div className={`text-lg font-semibold mt-2 ${
            level === 'very_high' ? 'text-red-400' :
            level === 'high' ? 'text-orange-400' :
            level === 'medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {getRiskText(level)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-sm text-gray-400">Statut ML</div>
              <div className="text-lg font-semibold text-green-400">
                {mlStatus?.initialized ? 'Actif' : 'Chargement...'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-sm text-gray-400">Précision</div>
              <div className="text-lg font-semibold text-blue-400">
                {mlStatus?.accuracy ? (mlStatus.accuracy * 100).toFixed(1) + '%' : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Données</div>
              <div className="text-lg font-semibold text-purple-400">
                {mlStatus?.samples || 0} échantillons
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jauge de risque principale */}
      <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            Niveau de Risque Actuel
          </h3>
          <p className="text-gray-400 mt-2">
            Analyse en temps réel basée sur les conditions de conduite
          </p>
        </div>

        <RiskGauge 
          percentage={probability ? probability * 100 : 0} 
          level={level} 
        />

        {/* Détails des features */}
        {features && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-sm text-gray-400">Température</div>
              <div className="text-lg font-semibold text-red-400">{features[0]}°C</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-sm text-gray-400">Humidité</div>
              <div className="text-lg font-semibold text-blue-400">{features[1]}%</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-sm text-gray-400">Vitesse</div>
              <div className="text-lg font-semibold text-purple-400">{features[2]} km/h</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-sm text-gray-400">Visibilité</div>
              <div className="text-lg font-semibold text-cyan-400">{features[3]} km</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-sm text-gray-400">Heure</div>
              <div className="text-lg font-semibold text-yellow-400">{features[4]}h</div>
            </div>
          </div>
        )}
      </div>

      {/* Recommandations */}
      <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          Recommandations de Sécurité
        </h3>
        
        <div className="space-y-3">
          {getRecommendations(level).map((recommendation, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className={`w-2 h-2 rounded-full ${
                level === 'very_high' ? 'bg-red-500' :
                level === 'high' ? 'bg-orange-500' :
                level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-gray-200">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Informations techniques */}
      <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Informations Techniques</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Dernière mise à jour</div>
            <div className="text-cyan-400 font-mono">{timestamp || 'En attente...'}</div>
          </div>
          
          <div>
            <div className="text-gray-400">Mode de calcul</div>
            <div className={isFallback ? 'text-yellow-400' : 'text-green-400'}>
              {isFallback ? 'Prédiction basique' : 'Intelligence Artificielle'}
            </div>
          </div>
          
          <div>
            <div className="text-gray-400">Source données</div>
            <div className="text-blue-400">{mlStatus?.dataSource || 'N/A'}</div>
          </div>
          
          <div>
            <div className="text-gray-400">Statut modèle</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                mlStatus?.initialized ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>{mlStatus?.initialized ? 'Opérationnel' : 'Initialisation'}</span>
            </div>
          </div>
        </div>

        {/* Bouton ré-entraînement */}
        {mlStatus?.initialized && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onRetrainModel}
              disabled={mlStatus?.training}
              className="flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${mlStatus?.training ? 'animate-spin' : ''}`} />
              {mlStatus?.training ? 'Entraînement...' : 'Ré-entraîner le modèle'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskDashboard;
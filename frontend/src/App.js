// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Thermometer, Droplet, Battery, Wind, MapPin, Activity, TrendingUp, AlertTriangle, Settings, Home, Gauge, Cpu, Cloud, Navigation, Compass } from 'lucide-react';
import { database, ref, onValue } from './firebase';
import VehicleMap from './components/VehicleMap';
import RiskDashboard from './components/RiskDashboard';
import { RiskPredictor } from './utils/riskPredictor';

export default function App() {
  const [vehicleData, setVehicleData] = useState({
    temperature: 0,
    humidity: 0,
    altitude: 0,
    latitude: 0,
    longitude: 0,
    battery: 0,
    speed: 0,
    led: 'blue',
    engine_state: 'OFF',
    timestamp: ''
  });

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    avgTemp: 0,
    avgHumidity: 0,
    maxSpeed: 0,
    totalDistance: 0
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [riskPrediction, setRiskPrediction] = useState({
    probability: 0,
    level: 'low',
    features: [],
    timestamp: '',
    isFallback: false
  });

  const [riskPredictor, setRiskPredictor] = useState(null);
  const [mlStatus, setMlStatus] = useState({
    initialized: false,
    training: false,
    accuracy: 0,
    samples: 0
  });

  // Change browser tab title
  useEffect(() => {
    document.title = "My Car Dashboard";
  }, []);

  // Risk predictor initialization
  useEffect(() => {
    const initializePredictor = async () => {
      try {
        console.log('🚀 Initializing risk predictor...');
        const predictor = new RiskPredictor();
        await predictor.initialize();
        
        setRiskPredictor(predictor);
        
        const status = predictor.getSystemStatus();
        setMlStatus({
          initialized: status.isInitialized,
          training: false,
          accuracy: status.model?.accuracy || 0,
          samples: status.model?.samplesCount || 0
        });
        
        console.log('✅ Predictor initialized successfully');
      } catch (error) {
        console.error('❌ Predictor initialization error:', error);
        setMlStatus(prev => ({ ...prev, initialized: false }));
      }
    };

    initializePredictor();
  }, []);

  // Firebase real-time connection
  useEffect(() => {
    const vehicleRef = ref(database, 'vehicule1');
    
    const unsubscribe = onValue(vehicleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('📡 Data received from Firebase:', data);
        setVehicleData(data);
        setIsConnected(true);
        
        setHistory(prev => {
          const updated = [...prev, { ...data, id: Date.now() }];
          return updated.slice(-100);
        });
      }
    }, (error) => {
      console.error("❌ Firebase error:", error);
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate statistics
  useEffect(() => {
    if (history.length > 0) {
      const avgTemp = history.reduce((sum, d) => sum + (d.temperature || 0), 0) / history.length;
      const avgHum = history.reduce((sum, d) => sum + (d.humidity || 0), 0) / history.length;
      const maxSpd = Math.max(...history.map(d => d.speed || 0));
      
      setStats({
        avgTemp: avgTemp.toFixed(1),
        avgHumidity: avgHum.toFixed(1),
        maxSpeed: maxSpd.toFixed(1),
        totalDistance: (history.length * 0.5).toFixed(1)
      });
    }
  }, [history]);

  // Risk calculation
  useEffect(() => {
    const calculateRisk = async () => {
      if (riskPredictor && mlStatus.initialized) {
        try {
          console.log('🎯 Calculating risk with ML...');
          const riskResult = await riskPredictor.calculateRisk(vehicleData);
          
          setRiskPrediction({
            probability: riskResult.probability,
            level: riskResult.level,
            features: riskResult.features,
            timestamp: riskResult.timestamp,
            isFallback: riskResult.isFallback || false
          });
          
          console.log(`🔮 Risk calculated: ${(riskResult.probability * 100).toFixed(1)}% (${riskResult.level})`);
          
        } catch (error) {
          console.error('❌ Risk calculation error:', error);
          setRiskPrediction(prev => ({
            ...prev,
            level: 'error',
            isFallback: true
          }));
        }
      }
    };

    if (vehicleData.temperature !== undefined && mlStatus.initialized) {
      calculateRisk();
    }
  }, [vehicleData, riskPredictor, mlStatus.initialized]);

  // Force model retraining
  const handleRetrainModel = async () => {
    if (!riskPredictor) return;
    
    try {
      setMlStatus(prev => ({ ...prev, training: true }));
      console.log('🔄 Starting retraining...');
      
      await riskPredictor.retrainModel();
      
      const status = riskPredictor.getSystemStatus();
      setMlStatus({
        initialized: true,
        training: false,
        accuracy: status.model?.accuracy || 0,
        samples: status.model?.samplesCount || 0
      });
      
      console.log('✅ Retraining completed');
    } catch (error) {
      console.error('❌ Retraining error:', error);
      setMlStatus(prev => ({ ...prev, training: false }));
    }
  };

  // Circular Gauge Component (FIXED)
  const CircularGauge = ({ value, max, label, color, unit }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const angle = (percentage / 100) * 180;
    
    // Calculate the end point of the arc
    const endX = 20 + 160 * (angle / 180);
    const endY = 100 - 80 * Math.sin((angle * Math.PI) / 180);
    
    return (
      <div className="relative w-full h-40 flex flex-col items-center justify-center">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke="#1f2937"
            strokeWidth="12"
            opacity="0.3"
          />
          {/* Progress arc - FIXED PATH CALCULATION */}
          <path
            d={`M20 100 A80 80 0 ${angle > 90 ? 1 : 0} 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'all 0.5s ease'
            }}
          />
          {/* Scale ticks */}
          {[0, 25, 50, 75, 100].map(tick => {
            const tickAngle = (tick / 100) * 180;
            const x1 = 20 + 160 * (tickAngle / 180);
            const y1 = 100 - 80 * Math.sin((tickAngle * Math.PI) / 180);
            const x2 = 20 + 150 * (tickAngle / 180);
            const y2 = 100 - 70 * Math.sin((tickAngle * Math.PI) / 180);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4b5563"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2 text-center">
          <div className="text-3xl font-bold" style={{ color }}>{value}{unit}</div>
          <div className="text-xs text-gray-400 mt-1">{label}</div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  // Weather condition based on temperature and humidity
  const getWeatherCondition = () => {
    const { temperature, humidity } = vehicleData;
    if (temperature > 30 && humidity < 40) return { condition: 'Sunny', icon: '☀️' };
    if (temperature > 25 && humidity > 60) return { condition: 'Cloudy', icon: '☁️' };
    if (humidity > 80) return { condition: 'Rainy', icon: '🌧️' };
    if (temperature < 10) return { condition: 'Cold', icon: '❄️' };
    return { condition: 'Clear', icon: '🌤️' };
  };

  // Calculate engine performance
  const getEnginePerformance = () => {
    const { speed, engine_state, temperature } = vehicleData;
    
    if (engine_state === 'OFF') return { performance: 'Off', level: 'gray' };
    
    let performance;
    let level;
    
    if (speed === 0 && engine_state === 'ON') {
      performance = 'Idle';
      level = 'yellow';
    } else if (speed > 0 && speed <= 60) {
      performance = 'Optimal';
      level = 'green';
    } else if (speed > 60 && speed <= 100) {
      performance = 'High';
      level = 'blue';
    } else if (speed > 100) {
      performance = 'Very High';
      level = 'orange';
    } else if (temperature > 35) {
      performance = 'Overheating';
      level = 'red';
    } else {
      performance = 'Normal';
      level = 'green';
    }
    
    return { performance, level };
  };

  const weather = getWeatherCondition();
  const enginePerformance = getEnginePerformance();

  // LED Indicator Component
  const LEDIndicator = ({ color, active, label }) => {
    const colors = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      blue: 'bg-blue-500'
    };
    
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
        <div 
          className={`w-4 h-4 rounded-full ${active ? colors[color] : 'bg-gray-700'} ${active ? 'animate-pulse' : ''}`}
          style={active ? { boxShadow: `0 0 15px ${color}` } : {}}
        ></div>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
    );
  };

  // ML Status Indicator
  const MLStatusIndicator = () => (
    <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${
        mlStatus.initialized ? 
          (mlStatus.training ? 'bg-yellow-400 animate-pulse' : 'bg-green-400') 
          : 'bg-red-400'
      }`}></div>
      <span className="text-sm">
        {mlStatus.training ? 'Training...' : 
         mlStatus.initialized ? `ML Active (${(mlStatus.accuracy * 100).toFixed(0)}%)` : 
         'ML Loading...'}
      </span>
      {mlStatus.initialized && !mlStatus.training && (
        <button 
          onClick={handleRetrainModel}
          className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/30 transition-colors"
          title="Retrain model"
        >
          🔄
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="flex h-screen">
        
        {/* Sidebar */}
        <div className="w-20 bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 space-y-8">
          <div className="text-2xl font-bold text-cyan-400">🚗</div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Home className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'map' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            <MapPin className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('prediction')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'prediction' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            <AlertTriangle className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            <TrendingUp className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Activity className="w-6 h-6" />
          </button>
          <div className="flex-1"></div>
          <button className="p-3 rounded-xl text-gray-400 hover:text-white transition-all">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                My Car Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">Real-time vehicle monitoring system</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${vehicleData.engine_state === 'ON' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">Engine {vehicleData.engine_state}</span>
              </div>
              
              <MLStatusIndicator />
              
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                <span className="text-xs text-gray-400">Last Update</span>
                <div className="text-sm font-mono">{vehicleData.timestamp || 'Waiting...'}</div>
              </div>

              {/* Your Name - MODIFIED: Removed "Developer" */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl px-4 py-2">
                <div className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Roua Khadhraoui
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              {/* Main Cards - Weather and Engine Performance instead of Temperature and Humidity */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Weather Card */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Cloud className="w-8 h-8 text-blue-400" />
                    <div className="text-3xl">{weather.icon}</div>
                  </div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">{weather.condition}</div>
                  <div className="text-gray-400 text-sm">Weather Condition</div>
                  <div className="mt-4 text-sm text-gray-300">
                    Temp: {vehicleData.temperature}°C • Hum: {vehicleData.humidity}%
                  </div>
                </div>

                {/* Engine Performance Card - NEW CARD */}
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-900/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Compass className="w-8 h-8 text-orange-400" />
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      enginePerformance.level === 'green' ? 'bg-green-500' : 
                      enginePerformance.level === 'red' ? 'bg-red-500' : 
                      enginePerformance.level === 'yellow' ? 'bg-yellow-500' : 
                      enginePerformance.level === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}>
                      {enginePerformance.performance}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-orange-400 mb-2">{vehicleData.speed}</div>
                  <div className="text-gray-400 text-sm">Engine Performance</div>
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                      style={{ width: `${Math.min((vehicleData.speed / 120) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Speed Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Wind className="w-8 h-8 text-purple-400" />
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${vehicleData.speed > 100 ? 'bg-orange-500' : 'bg-green-500'}`}>
                      {vehicleData.speed > 100 ? 'FAST' : 'NORMAL'}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-purple-400 mb-2">{vehicleData.speed}</div>
                  <div className="text-gray-400 text-sm">Speed</div>
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                      style={{ width: `${Math.min((vehicleData.speed / 120) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Battery Card */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Battery className="w-8 h-8 text-green-400" />
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${vehicleData.battery < 20 ? 'bg-red-500' : vehicleData.battery < 50 ? 'bg-orange-500' : 'bg-green-500'}`}>
                      {vehicleData.battery < 20 ? 'LOW' : vehicleData.battery < 50 ? 'MEDIUM' : 'GOOD'}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-green-400 mb-2">{vehicleData.battery}%</div>
                  <div className="text-gray-400 text-sm">Battery</div>
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                      style={{ width: `${vehicleData.battery}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Circular Gauges */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-red-400" />
                    Temperature Gauge
                  </h3>
                  <CircularGauge 
                    value={vehicleData.temperature} 
                    max={100} 
                    label="External Temperature"
                    color="#ef4444"
                    unit="°C"
                  />
                </div>

                <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-blue-400" />
                    Humidity Gauge
                  </h3>
                  <CircularGauge 
                    value={vehicleData.humidity} 
                    max={100} 
                    label="Humidity Level"
                    color="#3b82f6"
                    unit="%"
                  />
                </div>
              </div>

              {/* LED Alert System */}
              <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  LED Alert System
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <LEDIndicator 
                    color="red" 
                    active={vehicleData.led === 'red'} 
                    label="Critical: Temp > 60°C or Hum > 80%"
                  />
                  <LEDIndicator 
                    color="orange" 
                    active={vehicleData.led === 'orange'} 
                    label="Warning: Temp > 40°C or Hum > 70%"
                  />
                  <LEDIndicator 
                    color="blue" 
                    active={vehicleData.led === 'blue'} 
                    label="Normal: Optimal conditions"
                  />
                </div>
              </div>
            </>
          )}

          {/* Map Tab - WITH GPS COORDINATES */}
          {activeTab === 'map' && (
            <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Real-time GPS Position
              </h3>
              
              {/* GPS Coordinates Information - ADDED BACK */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Latitude
                  </div>
                  <div className="text-lg font-mono text-cyan-400">{vehicleData.latitude}°</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Longitude
                  </div>
                  <div className="text-lg font-mono text-blue-400">{vehicleData.longitude}°</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Altitude
                  </div>
                  <div className="text-lg font-mono text-green-400">{vehicleData.altitude} m</div>
                </div>
              </div>

              <VehicleMap vehicleData={vehicleData} />
            </div>
          )}

          {/* Risk Prediction Tab */}
          {activeTab === 'prediction' && (
            <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Road Risk Prediction
              </h3>
              <RiskDashboard 
                riskPrediction={riskPrediction} 
                vehicleData={vehicleData}
                mlStatus={mlStatus}
                onRetrainModel={handleRetrainModel}
              />
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Average Temperature</div>
                  <div className="text-3xl font-bold text-cyan-400">{stats.avgTemp}°C</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Average Humidity</div>
                  <div className="text-3xl font-bold text-blue-400">{stats.avgHumidity}%</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Max Speed</div>
                  <div className="text-3xl font-bold text-purple-400">{stats.maxSpeed} km/h</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-2">Total Distance</div>
                  <div className="text-3xl font-bold text-green-400">{stats.totalDistance} km</div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Data History ({history.length} entries)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900/50 text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Timestamp</th>
                      <th className="px-4 py-3 text-left">Temp (°C)</th>
                      <th className="px-4 py-3 text-left">Hum (%)</th>
                      <th className="px-4 py-3 text-left">Speed</th>
                      <th className="px-4 py-3 text-left">Battery</th>
                      <th className="px-4 py-3 text-left">LED</th>
                      <th className="px-4 py-3 text-left">Engine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {history.slice(-20).reverse().map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{entry.timestamp}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded ${entry.temperature > 60 ? 'bg-red-500/20 text-red-400' : entry.temperature > 40 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                            {entry.temperature}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded ${entry.humidity > 80 ? 'bg-red-500/20 text-red-400' : entry.humidity > 70 ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {entry.humidity}
                          </span>
                        </td>
                        <td className="px-4 py-3">{entry.speed} km/h</td>
                        <td className="px-4 py-3">{entry.battery}%</td>
                        <td className="px-4 py-3">
                          <div className={`w-3 h-3 rounded-full ${entry.led === 'red' ? 'bg-red-500' : entry.led === 'orange' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${entry.engine_state === 'ON' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {entry.engine_state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
import React from "react";
import { Thermometer, Droplet, Gauge, Battery, Wind } from "lucide-react";

export default function DashboardPro() {
  const data = {
    temperature: 25.6,
    humidity: 48,
    altitude: 320,
    battery: 76,
    speed: 82,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold mb-10 flex items-center gap-3">
        🚗 <span className="text-cyan-400">Smart Vehicle Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Température */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center">
          <Thermometer className="w-12 h-12 text-red-400 mb-3" />
          <h2 className="text-xl font-semibold mb-1">Température</h2>
          <p className="text-3xl font-bold">{data.temperature}°C</p>
        </div>

        {/* Humidité */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center">
          <Droplet className="w-12 h-12 text-blue-400 mb-3" />
          <h2 className="text-xl font-semibold mb-1">Humidité</h2>
          <p className="text-3xl font-bold">{data.humidity}%</p>
        </div>

        {/* Altitude */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center">
          <Gauge className="w-12 h-12 text-green-400 mb-3" />
          <h2 className="text-xl font-semibold mb-1">Altitude</h2>
          <p className="text-3xl font-bold">{data.altitude} m</p>
        </div>

        {/* Batterie */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center">
          <Battery className="w-12 h-12 text-yellow-400 mb-3" />
          <h2 className="text-xl font-semibold mb-1">Batterie</h2>
          <p className="text-3xl font-bold">{data.battery}%</p>
        </div>

        {/* Vitesse */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center">
          <Wind className="w-12 h-12 text-cyan-400 mb-3" />
          <h2 className="text-xl font-semibold mb-1">Vitesse</h2>
          <p className="text-3xl font-bold">{data.speed} km/h</p>
        </div>
      </div>
    </div>
  );
}

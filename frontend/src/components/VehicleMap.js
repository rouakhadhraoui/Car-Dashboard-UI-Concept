import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, mapStyles, defaultCenter } from '../config/maps';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
  border: '1px solid #374151'
};

export default function VehicleMap({ vehicleData }) {
  const [selectedMarker, setSelectedMarker] = React.useState(null);
  const [map, setMap] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const vehiclePosition = {
    lat: parseFloat(vehicleData.latitude) || defaultCenter.lat,
    lng: parseFloat(vehicleData.longitude) || defaultCenter.lng
  };

  const getMarkerColor = () => {
    switch(vehicleData.led) {
      case 'red': return '#ef4444';
      case 'orange': return '#f97316';
      default: return '#3b82f6';
    }
  };

  // SVG personnalisé pour le marqueur (sans émoji)
  const getMarkerSvg = (color) => {
    return `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 38C20 38 38 26 38 15C38 6.71573 31.2843 0 23 0C14.7157 0 8 6.71573 8 15C8 26 20 38 20 38Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="20" cy="15" r="6" fill="white"/>
        <circle cx="20" cy="15" r="3" fill="${color}"/>
      </svg>
    `;
  };

  const onLoad = React.useCallback((map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
    setIsLoaded(false);
  }, []);

  const markerIcon = isLoaded ? {
    url: 'data:image/svg+xml;base64,' + btoa(getMarkerSvg(getMarkerColor())),
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40)
  } : null;

  return (
    <div className="relative">
      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => setIsLoaded(true)}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={vehiclePosition}
          zoom={15}
          options={{
            styles: mapStyles,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            backgroundColor: '#1f2937'
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {isLoaded && markerIcon && (
            <Marker
              position={vehiclePosition}
              icon={markerIcon}
              onClick={() => setSelectedMarker(vehicleData)}
            />
          )}
          
          {selectedMarker && isLoaded && (
            <InfoWindow
              position={vehiclePosition}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="text-gray-800 p-3 min-w-[220px] bg-white rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-2 text-cyan-600">🚗 Véhicule Connecté</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Température:</span>
                    <span className={`font-semibold ${
                      vehicleData.temperature > 60 ? 'text-red-500' : 
                      vehicleData.temperature > 40 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {vehicleData.temperature}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Humidité:</span>
                    <span className={`font-semibold ${
                      vehicleData.humidity > 80 ? 'text-red-500' : 
                      vehicleData.humidity > 70 ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {vehicleData.humidity}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vitesse:</span>
                    <span className="font-semibold text-purple-600">{vehicleData.speed} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Batterie:</span>
                    <span className={`font-semibold ${
                      vehicleData.battery < 20 ? 'text-red-500' : 
                      vehicleData.battery < 50 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {vehicleData.battery}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`font-bold px-2 py-1 rounded text-xs ${
                      vehicleData.led === 'red' ? 'bg-red-100 text-red-700' : 
                      vehicleData.led === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {vehicleData.led.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      
      {/* Overlay de chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <div className="text-cyan-400">Chargement de la carte...</div>
          </div>
        </div>
      )}
    </div>
  );
}
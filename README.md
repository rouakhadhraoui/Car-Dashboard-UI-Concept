# IoT System for Connected Vehicles

## Project Description

A comprehensive IoT system for real-time monitoring and road risk prediction in connected vehicles. This solution collects, analyzes, and visualizes environmental and geolocation data to enhance road safety through predictive analytics.

## Objectives

- **Environmental Monitoring**: Real-time measurement of temperature, humidity, and altitude
- **GPS Tracking**: Route optimization and risk zone identification
- **Road Safety**: Predictive risk analysis based on historical data
- **Smart Alerts**: Visual notification system for drivers

## System Architecture

### Data Collection
- **Integrated Sensors**: NEO-6M GPS, temperature/humidity sensors
- **Firebase Variables**:
  - `latitude` / `longitude` (String) - GPS position
  - `altitude` (Number) - Relative height
  - `temperature` (Number) - °C
  - `humidity` (Number) - Humidity percentage
  - `timestamp` (String) - Timestamp

### 🔄 Data Processing
- **Storage**: Firebase Realtime Database
- **Analysis**: Average calculations, pattern identification
- **History**: Complete archiving for predictive analysis

### 📈 Visualization
- **Real-time dashboard** with interactive gauges
- **Google Maps integration** with live positioning
- **LED alert system**:
  - 🔴 **Red**: Temperature > 60°C OR Humidity > 80% OR Dangerous zone
  - 🟠 **Orange**: Temperature > 40°C OR Humidity > 70%
  - 🔵 **Blue**: Normal conditions

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Firebase account
- GPS modules and sensors

### Installation
```bash
# Clone repository
git clone https://github.com/rouakhadhraoui/Car-Dashboard-UI-Concept.git

# Install dependencies
cd Car-Dashboard-UI-Concept
npm install

# Firebase configuration
cp firebase-config.example.js firebase-config.js
# Edit with your Firebase credentials
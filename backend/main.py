import firebase_admin
from firebase_admin import credentials, db
import random
import time
from datetime import datetime

# ---------------------------
# 🔐 1. Configuration Firebase
# ---------------------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://iot-vehicules-default-rtdb.firebaseio.com/'   # 👉 Mets ici ton vrai lien Firebase !
})

# Référence à la base
vehicule_ref = db.reference('vehicule1')


# ----------------------------------
# ⚙️ 2. Fonction pour LED et moteur
# ----------------------------------
def get_led_color(temp, hum):
    """Retourne la couleur LED selon les seuils."""
    if temp > 60 or hum > 80:
        return "red"
    elif 40 <= temp <= 60 or 60 <= hum <= 80:
        return "orange"
    else:
        return "blue"


def get_engine_state(speed):
    """Retourne l'état moteur (ON/OFF) selon la vitesse."""
    return "ON" if speed > 0 else "OFF"


# -----------------------------------
# 🚗 3. Boucle principale d’envoi
# -----------------------------------
while True:
    # Génération des valeurs simulées
    temperature = round(random.uniform(20, 80), 2)
    humidity = round(random.uniform(20, 90), 2)
    altitude = round(random.uniform(10, 60), 2)
    latitude = 36.806389
    longitude = 10.181667
    speed = round(random.uniform(0, 120), 2)
    battery = round(random.uniform(40, 100), 2)
    engine_state = get_engine_state(speed)
    led = get_led_color(temperature, humidity)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Création du dictionnaire à envoyer
    vehicule_data = {
        "latitude": latitude,
        "longitude": longitude,
        "altitude": altitude,
        "temperature": temperature,
        "humidity": humidity,
        "speed": speed,
        "battery": battery,
        "engine_state": engine_state,
        "led": led,
        "timestamp": timestamp
    }

    # Envoi à Firebase
    vehicule_ref.set(vehicule_data)

    # Affichage console
    print(f"[{timestamp}] Temp={temperature}°C | Hum={humidity}% | Speed={speed}km/h | Batt={battery}% | LED={led}")

    # Pause avant prochaine mise à jour (toutes les 5s)
    time.sleep(5)

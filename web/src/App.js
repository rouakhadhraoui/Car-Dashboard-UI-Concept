import React, { useEffect, useState } from "react";
import { database, ref, onValue } from "./firebase";

function App() {
  const [vehicules, setVehicules] = useState([]);

  useEffect(() => {
    const vehiculeRef = ref(database, "vehicule1/");
    onValue(vehiculeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const values = Object.values(data);
        setVehicules(values.reverse()); // afficher du plus récent au plus ancien
      }
    });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🚗 Tableau de bord IoT - Véhicule 1</h1>

      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th>Timestamp</th>
            <th>Température (°C)</th>
            <th>Humidité (%)</th>
            <th>Altitude</th>
            <th>LED</th>
          </tr>
        </thead>
        <tbody>
          {vehicules.map((v, index) => (
            <tr key={index}>
              <td>{v.timestamp}</td>
              <td>{v.temperature}</td>
              <td>{v.humidity}</td>
              <td>{v.altitude}</td>
              <td style={{ fontWeight: "bold", color: v.led === "red" ? "red" : v.led === "orange" ? "orange" : "blue" }}>
                {v.led}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

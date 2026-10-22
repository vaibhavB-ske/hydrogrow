import React, { useState } from "react";
import './smartPlant.css';
import './SensorTester.css';

const sensorThresholdDetails = {
  temperature: {
    title: "Water Temperature",
    unit: "°C",
    icon: "🌡️",
    normalRange: "18°C – 22°C",
    below: "Nutrient absorption slows down drastically. Plant metabolic processes stall and root development stunts.",
    above: "Dissolved oxygen drops rapidly. High risk of root rot (Pythium), bacterial growth, and thermal root shock."
  },
  humidity: {
    title: "Ambient Humidity",
    unit: "%",
    icon: "💧",
    normalRange: "50% – 70%",
    below: "Transpiration speeds up excessively, leading to leaf tip burn, moisture stress, and severe dehydration.",
    above: "Air circulation stalls. High risk of powdery mildew, botrytis, and fungal root infections."
  },
  waterLevel: {
    title: "Water Tank Level",
    unit: "%",
    icon: "🚰",
    normalRange: "40% – 90%",
    below: "Submersible pump risks running dry and burning out. Nutrient concentrations spike, threatening root burn.",
    above: "Risk of reservoir overflow and diluted nutrient ratios reducing plant uptake efficiency."
  },
  flowRate: {
    title: "Water Flow Rate",
    unit: "L/min",
    icon: "🌊",
    normalRange: "1.5 – 3.0 L/min",
    below: "Exposed bare roots dry out quickly without constant nutrient circulation. Nutrient film breaks down.",
    above: "Excess pressure may dislodge net cups or overwhelm drainage channels causing channel spills."
  },
  lightIntensity: {
    title: "Light Intensity",
    unit: "%",
    icon: "☀️",
    normalRange: "60% – 85%",
    below: "Photosynthesis slows down causing leggy, weak plant stems and pale foliage.",
    above: "Excessive heat radiation causes foliage scorching, photo-bleaching, and water temperature spikes."
  }
};

export default function SensorTester({ sensorList = [], data = {}, esp32Online = false }) {
  const [activeSensorModal, setActiveSensorModal] = useState(null);

  return (
    <>
      <section id="sensors" className="sensor-grid">
        {sensorList.map((sensor) => {
          const value = esp32Online ? data[sensor.key] : 0;

          return (
            <article 
              className="sensor-card clickable-card" 
              key={sensor.key}
              onClick={() => setActiveSensorModal(sensor.key)}
              title="Click for threshold impact analysis"
            >
              <div className="sensor-card-top">
                <span className="sensor-icon">{sensor.icon}</span>
                <span className={`small-status ${esp32Online ? "online" : "offline"}`}>
                  {esp32Online ? "● CONNECTED" : "○ DISCONNECTED"}
                </span>
              </div>
              <p className="sensor-title">{sensor.title}</p>
              <h2 className="sensor-value">
                {Number(value ?? 0).toLocaleString(undefined, {
                  maximumFractionDigits: 2
                })}
                <small className="sensor-unit"> {sensor.unit}</small>
              </h2>
              <div className="sensor-bottom">
                <span>View threshold details ➔</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Threshold Modal Overlay */}
      {activeSensorModal && sensorThresholdDetails[activeSensorModal] && (
        <div className="modal-overlay" onClick={() => setActiveSensorModal(null)}>
          <div className="sensor-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">{sensorThresholdDetails[activeSensorModal].icon}</span>
                <h2>{sensorThresholdDetails[activeSensorModal].title}</h2>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveSensorModal(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-stat-row">
                <span>Current Reading</span>
                <strong>
                  {esp32Online ? data[activeSensorModal] : 0} {sensorThresholdDetails[activeSensorModal].unit}
                </strong>
              </div>
              <div className="modal-stat-row">
                <span>Optimal Range</span>
                <span className="range-badge">{sensorThresholdDetails[activeSensorModal].normalRange}</span>
              </div>

              <div className="threshold-box alert-below">
                <h4>▼ Drops BELOW Optimal Range</h4>
                <p>{sensorThresholdDetails[activeSensorModal].below}</p>
              </div>

              <div className="threshold-box alert-above">
                <h4>▲ Rises ABOVE Optimal Range</h4>
                <p>{sensorThresholdDetails[activeSensorModal].above}</p>
              </div>
            </div>

            <button className="primary-btn modal-dismiss-btn" onClick={() => setActiveSensorModal(null)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
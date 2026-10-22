import { useEffect, useState } from "react";
import SmartPlant from "./smartPlant";
import LandingPage from "./LandingPage";
import SensorTester from "./SensorTester";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { auth, db } from "./firebase";
import "./App.css";

const sensorList = [
  { key: "temperature", title: "Temperature", unit: "°C", icon: "🌡️" },
  { key: "humidity", title: "Humidity", unit: "%", icon: "💧" },
  { key: "waterLevel", title: "Water Tank Level", unit: "%", icon: "🚰" },
  { key: "flowRate", title: "Water Flow Rate", unit: "L/min", icon: "🌊" },
  { key: "lightIntensity", title: "Light Intensity", unit: "%", icon: "☀️" }
];

const zeroReadings = {
  temperature: 0,
  humidity: 0,
  waterLevel: 0,
  flowRate: 0,
  lightIntensity: 0
};

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // App State
  const [data, setData] = useState(zeroReadings);
  const [history, setHistory] = useState([]);
  const [commands, setCommands] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState("24h");

  const [lastDataReceivedAt, setLastDataReceivedAt] = useState(null);
  const [esp32Online, setEsp32Online] = useState(false);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("hydrogrow-theme") || "light"
  );

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("hydrogrow-theme", nextTheme);
  }

  // Monitor Authentication State
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
  }, []);

  // Monitor Firebase Database when logged in
  useEffect(() => {
    if (!user) {
      setData(zeroReadings);
      setLastDataReceivedAt(null);
      setEsp32Online(false);
      setHistory([]);
      setCommands({});
      return;
    }

    setData(zeroReadings);
    setLastDataReceivedAt(null);
    setEsp32Online(false);

    const unsubscribeCurrent = onValue(
      ref(db, "hydroponics/current"),
      (snapshot) => {
        const readings = snapshot.val();
        const rawTimestamp = Number(readings?.lastUpdated);

        const timestamp = rawTimestamp > 0
        ? (rawTimestamp < 1e12 ? rawTimestamp * 1000 : rawTimestamp)
        : 0;

        const age = Date.now() - timestamp;

        if (readings && Number.isFinite(timestamp) && timestamp > 0 && age >= 0 && age < 60000) {
          setData({
            temperature: readings.temperature ?? 0,
            humidity: readings.humidity ?? 0,
            waterLevel: readings.waterLevel ?? 0,
            flowRate: readings.flowRate ?? 0,
            lightIntensity: readings.lightIntensity ?? 0
          });
          setLastDataReceivedAt(timestamp);
          setEsp32Online(true);
        } else {
          setData(zeroReadings);
          setEsp32Online(false);
          setLastDataReceivedAt(Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null);
        }
      },
      (error) => {
        setData(zeroReadings);
        setEsp32Online(false);
        setLastDataReceivedAt(null);
        setMessage("Sensor data: " + error.message);
      }
    );

    const unsubscribeHistory = onValue(
      ref(db, "hydroponics/history"),
      (snapshot) => {
        const value = snapshot.val() || {};
        const entries = Object.entries(value)
          .map(([id, item]) => ({ id, ...item }))
          .filter((item) => Number.isFinite(Number(item.timestamp)))
          .sort((a, b) => a.timestamp - b.timestamp);
        setHistory(entries);
      },
      (error) => setMessage("History: " + error.message)
    );

    const unsubscribeCommands = onValue(
      ref(db, "hydroponics/commands"),
      (snapshot) => setCommands(snapshot.val() || {}),
      (error) => setMessage("Commands: " + error.message)
    );

    return () => {
      unsubscribeCurrent();
      unsubscribeHistory();
      unsubscribeCommands();
    };
  }, [user]);

  // Connection Watchdog
  useEffect(() => {
    if (!user || lastDataReceivedAt === null) return;
    const checkConnection = () => {
      const age = Date.now() - lastDataReceivedAt;
      if (age >= 15000 || age < 0) {
        setEsp32Online(false);
        setData(zeroReadings);
      } else {
        setEsp32Online(true);
      }
    };
    checkConnection();
    const timer = setInterval(checkConnection, 500);
    return () => clearInterval(timer);
  }, [user, lastDataReceivedAt]);

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    if (isRegistering && !fullName.trim()) return setMessage("Enter your full name.");
    if (isRegistering && password.length < 6) return setMessage("Password must be at least 6 characters.");
    if (isRegistering && password !== confirmPassword) return setMessage("Passwords do not match.");

    setBusy(true);

    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(result.user, { displayName: fullName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  async function sendCommand(path, value, successMessage) {
    setMessage("");
    if (!esp32Online) {
      setMessage("ESP32 disconnected. Command not sent.");
      return;
    }
    try {
      await set(ref(db, "hydroponics/commands/" + path), value);
      setMessage(successMessage);
    } catch (error) {
      setMessage("Command failed: " + error.message);
    }
  }

  async function togglePump(on) {
    if (!esp32Online) return setMessage("ESP32 disconnected.");
    if (on && Number(data.waterLevel) < 20) return setMessage("Pump ON blocked: water level is below 20%.");
    
    await sendCommand(
      "pump",
      { state: on ? "ON" : "OFF", requestedAt: Date.now(), requestedBy: user.uid },
      "Pump command sent."
    );
  }

  async function requestWatering() {
    if (!esp32Online) return setMessage("ESP32 disconnected.");
    
    await sendCommand(
      "watering",
      { requested: true, durationSeconds: 30, requestedAt: Date.now(), requestedBy: user.uid },
      "Watering request sent."
    );
  }

  async function changeMode(mode) {
    if (!esp32Online) return setMessage("ESP32 disconnected.");
    await sendCommand("mode", { value: mode, requestedAt: Date.now(), requestedBy: user.uid }, "Mode command sent.");
  }

  if (checking) {
    return <div className="loading">Loading HydroGrow...</div>;
  }

  // --- Render Landing Page when unauthenticated ---
  if (!user) {
    return (
      <LandingPage 
        handleAuth={handleAuth}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        theme={theme}
        toggleTheme={toggleTheme}
        busy={busy}
        message={message}
        setMessage={setMessage}
      />
    );
  }

  const alerts = [];
  if (!esp32Online) {
    alerts.push({
      type: "critical",
      title: "ESP32 Disconnected",
      detail: "No fresh sensor update for 15 seconds. Check the ESP32 connection."
    });
  } else if (Number(data.waterLevel) < 20) {
    alerts.push({
      type: "critical",
      title: "Low Water Level",
      detail: "Refill the tank before operating the pump."
    });
  }

  if (esp32Online && commands.pump?.state === "ON" && Number(data.flowRate) <= 0) {
    alerts.push({
      type: "critical",
      title: "No Water Flow",
      detail: "Check the pump, tubing, and flow sensor."
    });
  }

  if (esp32Online && Number.isFinite(Number(data.temperature))) {
    const temp = Number(data.temperature);
    if (temp < 15) {
      alerts.push({
        type: "warning",
        title: "Low Temperature",
        detail: `Temperature is ${temp}°C. Check your growing environment.`
      });
    } else if (temp > 35) {
      alerts.push({
        type: "critical",
        title: "High Temperature",
        detail: `Temperature is ${temp}°C. Check cooling and ventilation.`
      });
    }
  }

  if (esp32Online && Number.isFinite(Number(data.lightIntensity))) {
    const light = Number(data.lightIntensity);
    if (light < 30) {
      alerts.push({
        type: "warning",
        title: "Low Light Intensity",
        detail: `Light intensity is ${light}%. Check the grow lights.`
      });
    } else if (light > 90) {
      alerts.push({
        type: "warning",
        title: "High Light Intensity",
        detail: `Light intensity is ${light}%. Check for excessive lighting.`
      });
    }
  }

  const now = Date.now();
  const ranges = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000
  };

  const visibleHistory = history.filter(
    (item) => now - item.timestamp <= ranges[period]
  );

  const chartPoints = visibleHistory
    .filter((item) => Number.isFinite(Number(item.temperature)))
    .slice(-40);

  const chartValues = chartPoints.map((item) => Number(item.temperature));
  const minTemp = chartValues.length ? Math.min(...chartValues) - 1 : 0;
  const maxTemp = chartValues.length ? Math.max(...chartValues) + 1 : 40;

  const chartPolyline = chartValues
    .map((value, index) => {
      const x = chartValues.length > 1
        ? (index / (chartValues.length - 1)) * 600
        : 300;
      const y = 150 - ((value - minTemp) / (maxTemp - minTemp || 1)) * 120;
      return `${x},${y}`;
    })
    .join(" ");

  // --- Render Dashboard when authenticated ---
  return (
    <div className={`dashboard ${theme}-mode`}>
      <aside className="sidebar">
        <div className="logo">🌱 HydroGrow</div>
        <p className="sidebar-label">MONITORING</p>
        <a href="#overview">▦ Overview</a>
        <a href="#sensors">◉ Sensors</a>
        <a href="#controls">⚙ Pump Control</a>
        <a href="#alerts">♧ Alerts</a>
        <a href="#history">▤ Analytics</a>

        <div className="sidebar-bottom">
          <span className="online-dot" />
          Remote dashboard
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Farm Overview</h1>
            <p className="muted">Monitor and manage your hydroponics system.</p>
          </div>

          <div className="profile">
            <label className="theme-toggle-switch">
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={toggleTheme}
              />
              <div className="theme-toggle-slider">
                <div className="theme-toggle-thumb">
                  {theme === "light" ? "☀️" : "🌙"}
                </div>
              </div>
            </label>

            <div className="avatar">🌿</div>
            <div>
              <strong>{user.displayName || "Farm User"}</strong>
              <small>{user.email}</small>
            </div>
            <button className="outline-btn" onClick={handleSignOut}>
              Log out
            </button>
          </div>
        </header>

        <section id="overview" className="welcome-banner">
          <div>
            <span className="eyebrow">HYDROPONICS CONTROL CENTER</span>
            <h2>Your farm, from anywhere.</h2>
            <p>Live readings and remote controls powered by Firebase.</p>
            <p>
              {esp32Online
                ? "🟢 ESP32 connected · Fresh sensor data"
                : "🔴 ESP32 disconnected · Sensor values reset to zero"}
            </p>
          </div>
          <div className="banner-image">
            {typeof SmartPlant !== "undefined" && <SmartPlant data={data} />}
          </div>
        </section>

        <SensorTester 
          sensorList={sensorList} 
          data={data} 
         esp32Online={esp32Online} 
          />

        <section className="content-grid">
          <article id="controls" className="panel controls-panel">
            <div className="panel-heading">
              <div>
                <h2>Remote pump control</h2>
                <p className="muted">
                  {esp32Online
                    ? "ESP32 connected · Commands available"
                    : "ESP32 disconnected · Commands disabled"}
                </p>
              </div>
              <span className="panel-icon">⚙</span>
            </div>

            <div className="mode-row">
              <span>Operating mode</span>
              <strong>{commands.mode?.value || "Not confirmed"}</strong>
            </div>

            <div className="button-row">
              <button
                className="outline-btn"
                disabled={!esp32Online}
                onClick={() => changeMode("AUTO")}
              >
                Automatic
              </button>
              <button
                className="outline-btn"
                disabled={!esp32Online}
                onClick={() => changeMode("MANUAL")}
              >
                Manual override
              </button>
            </div>

            <div className="pump-status">
              <div className="pump-symbol">♧</div>
              <div>
                <strong>Water pump</strong>
                <p className="muted">
                  Last requested: {commands.pump?.state || "Unknown"}
                </p>
              </div>
              <span
                className={
                  esp32Online && commands.pump?.state === "ON"
                    ? "status-on"
                    : "status-off"
                }
              >
                {esp32Online ? commands.pump?.state || "UNKNOWN" : "UNKNOWN"}
              </span>
            </div>

            <div className="button-row">
              <button
                className="pump-on"
                disabled={!esp32Online}
                onClick={() => togglePump(true)}
              >
                ▶ Pump ON
              </button>
              <button
                className="pump-off"
                disabled={!esp32Online}
                onClick={() => togglePump(false)}
              >
                ■ Pump OFF
              </button>
            </div>

            <button
              className="watering-btn"
              disabled={!esp32Online}
              onClick={requestWatering}
            >
              💧 Trigger extra watering · 30 seconds
            </button>

            <p className="footnote">
              {esp32Online
                ? "A sent command does not confirm pump operation."
                : "ESP32 disconnected. Pump command not confirmed."}
            </p>
          </article>

          <article id="alerts" className="panel alerts-panel">
            <div className="panel-heading">
              <div>
                <h2>Critical alerts</h2>
                <p className="muted">Based on available Firebase readings.</p>
              </div>
              <span className="alert-number">{alerts.length}</span>
            </div>

            {alerts.length === 0 ? (
              <div className="no-alerts">
                <span>✓</span>
                <div>
                  <strong>No active threshold alerts</strong>
                  <p className="muted">
                    Missing readings must not be treated as safe.
                  </p>
                </div>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div className={`alert-item ${alert.type}`} key={index}>
                  <span>{alert.type === "critical" ? "!" : "⚠"}</span>
                  <div>
                    <strong>{alert.title}</strong>
                    <p>{alert.detail}</p>
                  </div>
                </div>
              ))
            )}

            <div className="notification-note">
              <strong>Notification status</strong>
              <p>
                Dashboard alerts are active. Browser and phone push
                notifications require additional setup.
              </p>
            </div>
          </article>
        </section>

        <section id="history" className="panel history-panel">
          <div className="panel-heading history-heading">
            <div>
              <h2>Environmental analytics</h2>
              <p className="muted">Historical temperature readings</p>
            </div>

            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>

          {chartPoints.length > 0 ? (
            <>
              <div className="chart-summary">
                <span>Recorded readings: {chartPoints.length}</span>
                <span>Latest: {chartValues[chartValues.length - 1]}°C</span>
              </div>

              <svg
                className="history-chart"
                viewBox="0 0 600 180"
                role="img"
                aria-label="Historical temperature line graph"
              >
                {[30, 60, 90, 120, 150].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="currentColor"
                    opacity=".12"
                    strokeDasharray="5 5"
                  />
                ))}

                <polyline
                  points={chartPolyline}
                  fill="none"
                  stroke="#38d879"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>

              <p className="footnote">
                Historical charts require timestamped records under
                hydroponics/history.
              </p>
            </>
          ) : (
            <div className="empty-chart">
              <span>▥</span>
              <h3>No historical readings yet</h3>
              <p>
                Add timestamped sensor records to Firebase to view trends
                across hours, days, and weeks.
              </p>
            </div>
          )}
        </section>

        <footer className="footer">
          <span>🌱 HydroGrow · Remote monitoring</span>
          <span>
            {esp32Online ? "ESP32 updates received" : "ESP32 disconnected"}
          </span>
        </footer>

        {message && (
          <div className="toast" role="status">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}
      </main>
    </div>
  );
}

import React from 'react';

export default function LandingPage({
  handleAuth,
  isRegistering,
  setIsRegistering,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  theme,
  toggleTheme,
  busy,
  message,
  setMessage
}) {
  return (
    <div className={`landing-page ${theme}-mode`}>
      {/* Top Navigation */}
      <nav className="landing-nav">
        <div className="logo">🌱 HydroGrow</div>
        <div className="nav-links">
          <a href="#what-is-it">What is it?</a>
          <a href="#how-it-works">How it works</a>
          <a href="#auth-section" className="nav-btn">Sign In</a>
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
        </div>
      </nav>

      {/* Atmospheric Backgrounds */}
      <div className="parallax-bg layer-1"></div>
      <div className="parallax-bg layer-2"></div>

      {/* Hero Section: What is HydroGrow? */}
      <section id="what-is-it" className="landing-section split-layout" style={{ paddingTop: '120px' }}>
        <div className="text-content text-reveal">
          <span className="eyebrow fade-in-up">SMART HYDROPONICS</span>
          <h1 className="massive-title fade-in-up delay-1">HYDROGROW</h1>
          <p className="hero-subtitle fade-in-up delay-2">
            HydroGrow is a fully automated, soil-free Nutrient Film Technique (NFT) hydroponics platform. 
            By continuously recirculating oxygenated, nutrient-rich water directly past bare root systems, 
            plants achieve faster growth cycles with up to 90% less water usage compared to traditional soil farming.
          </p>
          <p className="hero-subtitle fade-in-up delay-2">
            Integrated with ESP32 microcontrollers and high-accuracy telemetry sensors, HydroGrow tracks real-time 
            environmental factors—such as water temperature, ambient humidity, fluid flow rates, and light intensity—giving 
            you complete visibility and control over your crop's health from any web browser.
          </p>
          <a href="#auth-section" className="hero-cta fade-in-up delay-3">
            Access Dashboard ➔
          </a>
        </div>
        
        <div className="image-content fade-in-up delay-2">
          <img 
            src={`${import.meta.env.BASE_URL}image_6d6a84.png`}
            alt="Full HydroGrow Hardware System" 
            className="animated-hardware-img floating-hero"
          />
        </div>
      </section>

      {/* Breakdown Section: How it Works & System Architecture */}
      <section id="how-it-works" className="landing-section vertical-layout">
        <div className="feature-text text-reveal text-center">
          <span className="eyebrow">THE ARCHITECTURE</span>
          <h2>System Architecture & Hardware Breakdown</h2>
          <p style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
            The physical system operates through a closed-loop recirculation mechanism. 
            A submersible pump elevates the nutrient solution from a primary reservoir into the upper growing channel. Gravity 
            then gently draws the fluid down past the exposed root net cups before it drains back into the main reservoir, ensuring constant oxygenation.
          </p>
          <p style={{ maxWidth: '800px', margin: '0 auto' }}>
            Simultaneously, the digital architecture utilizes an ESP32 Wi-Fi module to sample attached soil moisture probes, water level sensors, 
            flow meters, and ambient temperature gauges. These data packets are streamed live to a Firebase Realtime Database. The React web app listens to this database to render instant dashboard updates, plot historical analytics, and securely transmit your remote pump override commands back to the hardware.
          </p>
        </div>

        <div className="blueprint-container fade-in-up">
          <img 
            src={`${import.meta.env.BASE_URL}image_6d6ac6.png`}
            alt="HydroGrow Components and Water Flow" 
            className="animated-hardware-img slow-zoom"
          />
        </div>
      </section>

      {/* Authentication Card Section (Moved to Bottom) */}
      <section id="auth-section" className="auth-page">
        <form className="auth-card" onSubmit={handleAuth}>
          <div className="logo">🌱 HydroGrow</div>
          <p className="subtitle">Smart Hydroponics Monitoring</p>

          <div className="auth-character-wrapper">
            <div className="cartoon-gardener">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="gardener-bg" cx="50" cy="50" r="45" />

                <g className="sprout">
                  <path d="M72 68C72 68 76 60 82 62C88 64 84 72 80 72C76 72 72 68 72 68Z" className="plant-leaf" />
                  <path d="M74 68C74 68 68 62 64 66C60 70 66 75 70 74" className="plant-leaf" />
                  <path d="M73 68V78" strokeWidth="3" strokeLinecap="round" className="plant-stem" />
                </g>

                <circle className="water-drop drop-1" cx="48" cy="58" r="2" />
                <circle className="water-drop drop-2" cx="54" cy="64" r="1.5" />

                <path d="M30 78C30 65 38 58 50 58C62 58 70 65 70 78" strokeWidth="4" strokeLinecap="round" className="body-outline" />
                <g className="arm-watering">
                  <path d="M36 62L22 52L32 48" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="arm-path" />
                  <path d="M18 44H30L28 54H20L18 44Z" className="can-body" />
                  <path d="M30 46L38 42" strokeWidth="2" strokeLinecap="round" className="can-spout" />
                </g>

                <g className="gardener-head">
                  <circle cx="50" cy="38" r="16" className="head-base" />
                  <path d="M32 36C32 26 40 20 50 20C60 20 68 26 68 36H32Z" className="hat-top" />
                  <path d="M28 36H72" strokeWidth="3" strokeLinecap="round" className="hat-brim" />
                  <g className="gardener-eyes">
                    <circle cx="44" cy="38" r="2" className="eye" />
                    <circle cx="56" cy="38" r="2" className="eye" />
                  </g>
                  <path d="M46 44Q50 47 54 44" strokeWidth="2" strokeLinecap="round" className="smile" />
                </g>
              </svg>
            </div>
          </div>

          <h1>{isRegistering ? "Create account" : "Welcome back"}</h1>
          <p className="muted">
            {isRegistering
              ? "Create an account to monitor your farm."
              : "Log in to access your farm remotely."}
          </p>

          {isRegistering && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              minLength={isRegistering ? 6 : undefined}
              required
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isRegistering && (
            <>
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="password-field">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </>
          )}

          <button className="primary-btn" type="submit" disabled={busy}>
            {busy ? "Please wait..." : isRegistering ? "Create Account" : "Sign In"}
          </button>

          {message && <p className="error" role="alert">{message}</p>}

          <p className="switch-auth">
            {isRegistering ? "Already registered?" : "New to HydroGrow?"}{" "}
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
                setMessage("");
              }}
            >
              {isRegistering ? "Sign in" : "Create account"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}

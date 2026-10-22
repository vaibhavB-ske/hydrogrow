import React from "react";

export default function SmartPlant() {
  return (
    <div className="hydroponic-wrapper">
      <svg className="hydro-plant" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Vibrant Leaf Gradients */}
          <linearGradient id="leafDark" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="leafLight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="leafMid" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          
          {/* Water Gradient */}
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95" />
          </linearGradient>
          
          {/* Root Gradient */}
          <linearGradient id="rootGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Shadow */}
        <ellipse cx="100" cy="221" rx="45" ry="6" fill="rgba(0, 0, 0, 0.4)" className="plant-shadow" />
        
        {/* Water Fill - Now with a subtle pulse animation */}
        <path className="water-fill" d="M 55 140 L 145 140 L 145 208 Q 145 215 138 215 L 62 215 Q 55 215 55 208 Z" fill="url(#waterGrad)" />
        
        {/* Rising Bubbles (Added more for a cooler effect) */}
        <circle className="hydro-bubble b1" cx="75" cy="200" r="2.5" fill="#ffffff" opacity="0.8" />
        <circle className="hydro-bubble b2" cx="135" cy="180" r="3.5" fill="#ffffff" opacity="0.8" />
        <circle className="hydro-bubble b3" cx="95" cy="160" r="1.5" fill="#ffffff" opacity="0.6" />
        <circle className="hydro-bubble b4" cx="115" cy="195" r="2" fill="#ffffff" opacity="0.7" />
        <circle className="hydro-bubble b5" cx="65" cy="170" r="1" fill="#ffffff" opacity="0.5" />
        
        {/* Waving Golden Roots */}
        <path className="hydro-root root1" d="M 98 135 Q 88 165 92 195" fill="none" stroke="url(#rootGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <path className="hydro-root root2" d="M 100 135 L 100 185" fill="none" stroke="url(#rootGrad)" strokeWidth="3" strokeLinecap="round" />
        <path className="hydro-root root3" d="M 102 135 Q 112 165 108 198" fill="none" stroke="url(#rootGrad)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Glass Container Outline */}
        <path d="M 55 95 L 55 208 Q 55 215 62 215 L 138 215 Q 145 215 145 208 L 145 95" fill="none" stroke="rgba(129, 140, 248, 0.5)" strokeWidth="2.5" />
        <line x1="53.5" y1="95" x2="146.5" y2="95" stroke="rgba(129, 140, 248, 0.7)" strokeWidth="3" strokeLinecap="round"/>

        {/* Stem */}
        <path className="hydro-stem" d="M 100 35 L 100 130" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
        
        {/* Staggered Animated Leaves */}
        <path className="hydro-leaf leaf1" d="M 100 90 Q 65 95 62 70 Q 70 45 100 70 Z" fill="url(#leafDark)" />
        <path className="hydro-leaf leaf2" d="M 100 62 Q 78 58 82 38 Q 95 25 100 48 Z" fill="url(#leafLight)" />
        <path className="hydro-leaf leaf3" d="M 100 65 Q 132 35 142 50 Q 145 78 100 85 Z" fill="url(#leafMid)" />

        {/* Glowing Sensor Node */}
        <circle cx="100" cy="122" r="7" fill="#0f172a" stroke="#10b981" strokeWidth="2" filter="url(#neonGlow)" />
        <circle cx="100" cy="122" r="2.5" fill="#34d399" className="sensor-pulse" />
      </svg>
    </div>
  );
}
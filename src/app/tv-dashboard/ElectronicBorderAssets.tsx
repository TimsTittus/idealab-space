"use client";

import React from "react";

interface ElectronicBorderAssetsProps {
  theme?: "warm" | "dark";
}

export function ElectronicBorderAssets({ theme = "warm" }: ElectronicBorderAssetsProps) {
  const strokeColor = theme === "warm" ? "#1E1B18" : "#94A3B8";
  const bgCardColor = theme === "warm" ? "#FFFFFF" : "#1E293B";
  const shadowFilter = theme === "warm" ? "drop-shadow(0px 8px 12px rgba(45, 37, 2, 0.15))" : "drop-shadow(0px 8px 16px rgba(0,0,0,0.5))";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10 select-none">
      {/* ─── TOP LEFT: IC Microchip & PCB Traces ───────────────────────────── */}
      <div
        className="absolute -top-3 left-4 md:left-8 w-44 md:w-56 transition-transform duration-500 hover:scale-105"
        style={{ filter: shadowFilter }}
      >
        <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* PCB Corner Trace Lines */}
          <path d="M 0 40 L 40 40 L 70 70 M 0 60 L 30 60 L 60 90 M 0 80 L 20 80 L 50 110" stroke={theme === "warm" ? "#B45309" : "#38BDF8"} strokeWidth="2.5" strokeDasharray="4 3" opacity="0.6" />

          {/* Chip Body */}
          <rect x="50" y="20" width="130" height="90" rx="12" fill={theme === "warm" ? "#1E293B" : "#0F172A"} stroke={strokeColor} strokeWidth="3" />
          <rect x="65" y="32" width="100" height="66" rx="6" fill={theme === "warm" ? "#334155" : "#1E293B"} stroke={strokeColor} strokeWidth="1.5" />

          {/* Chip Die Center Notch */}
          <circle cx="75" cy="42" r="4" fill={theme === "warm" ? "#F59E0B" : "#38BDF8"} />
          <path d="M 90 55 L 140 55 M 90 65 L 140 65 M 90 75 L 125 75" stroke={theme === "warm" ? "#FCD34D" : "#818CF8"} strokeWidth="2" strokeLinecap="round" />
          <text x="90" y="44" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">IDEALAB-32</text>

          {/* Left Pins */}
          <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round">
            <line x1="30" y1="35" x2="50" y2="35" />
            <line x1="30" y1="50" x2="50" y2="50" />
            <line x1="30" y1="65" x2="50" y2="65" />
            <line x1="30" y1="80" x2="50" y2="80" />
            <line x1="30" y1="95" x2="50" y2="95" />
          </g>

          {/* Right Pins */}
          <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round">
            <line x1="180" y1="35" x2="200" y2="35" />
            <line x1="180" y1="50" x2="200" y2="50" />
            <line x1="180" y1="65" x2="200" y2="65" />
            <line x1="180" y1="80" x2="200" y2="80" />
            <line x1="180" y1="95" x2="200" y2="95" />
          </g>

          {/* Glowing Power LED */}
          <circle cx="170" cy="92" r="4" fill="#10B981" className="animate-pulse" />
          <circle cx="170" cy="92" r="8" fill="#10B981" opacity="0.3" className="animate-ping" />
        </svg>
      </div>

      {/* ─── TOP RIGHT: Soldering Station & Wire Reel ─────────────────────── */}
      <div
        className="absolute -top-2 right-4 md:right-10 w-44 md:w-56 transition-transform duration-500 hover:scale-105"
        style={{ filter: shadowFilter }}
      >
        <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Base Unit */}
          <rect x="20" y="25" width="110" height="85" rx="14" fill={bgCardColor} stroke={strokeColor} strokeWidth="3" />
          <rect x="35" y="38" width="55" height="30" rx="6" fill={theme === "warm" ? "#0F172A" : "#020617"} stroke={strokeColor} strokeWidth="1.5" />
          <text x="43" y="58" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="monospace">350°C</text>

          {/* Control Knob */}
          <circle cx="104" cy="53" r="11" fill={theme === "warm" ? "#F59E0B" : "#F43F5E"} stroke={strokeColor} strokeWidth="2" />
          <line x1="104" y1="53" x2="108" y2="45" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

          {/* Power Switch & Jack */}
          <rect x="35" y="78" width="22" height="18" rx="4" fill="#EF4444" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="75" cy="87" r="7" fill="#64748B" stroke={strokeColor} strokeWidth="1.5" />

          {/* Stand & Iron */}
          <path d="M 140 100 Q 155 45 190 25" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
          <path d="M 140 100 Q 155 45 190 25" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          {/* Iron Tip */}
          <polygon points="190,25 205,15 198,32" fill="#E2E8F0" stroke={strokeColor} strokeWidth="2" />

          {/* Heat Vapor Lines */}
          <path d="M 200 12 Q 205 5 202 0" stroke={theme === "warm" ? "#D97706" : "#38BDF8"} strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
          <path d="M 210 16 Q 215 9 212 4" stroke={theme === "warm" ? "#D97706" : "#38BDF8"} strokeWidth="2" strokeLinecap="round" className="animate-pulse" />

          {/* Solder Wire Coil */}
          <circle cx="140" cy="95" r="16" fill="#CBD5E1" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="140" cy="95" r="7" fill={bgCardColor} stroke={strokeColor} strokeWidth="2" />
        </svg>
      </div>

      {/* ─── LEFT MIDDLE: 3D Printer Extruder Head & Frame ────────────────── */}
      <div
        className="absolute top-1/3 -left-4 md:-left-2 w-32 md:w-44 transition-transform duration-500 hover:scale-105"
        style={{ filter: shadowFilter }}
      >
        <svg viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Vertical Z Rods */}
          <rect x="25" y="10" width="8" height="230" rx="3" fill="#64748B" stroke={strokeColor} strokeWidth="2" />
          <rect x="125" y="10" width="8" height="230" rx="3" fill="#64748B" stroke={strokeColor} strokeWidth="2" />

          {/* Horizontal X Carriage Bar */}
          <rect x="15" y="100" width="130" height="16" rx="4" fill={theme === "warm" ? "#1E293B" : "#334155"} stroke={strokeColor} strokeWidth="2" />

          {/* Extruder Head Assembly */}
          <rect x="55" y="80" width="50" height="55" rx="8" fill={bgCardColor} stroke={strokeColor} strokeWidth="3" />
          {/* Cooling Fan Grill */}
          <circle cx="80" cy="102" r="14" fill={theme === "warm" ? "#F59E0B" : "#0284C7"} stroke={strokeColor} strokeWidth="2" />
          <path d="M 72 102 L 88 102 M 80 94 L 80 110" stroke="#FFFFFF" strokeWidth="2" />

          {/* Nozzle Cone & Heat Block */}
          <polygon points="72,135 88,135 80,150" fill="#EAB308" stroke={strokeColor} strokeWidth="2" />

          {/* Red Hot Filament Layer Line */}
          <path d="M 80 150 L 80 165 L 110 165" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" className="animate-pulse" />

          {/* 3D Printed Object (Hexagonal Pillar forming) */}
          <polygon points="65,165 95,165 105,185 95,205 65,205 55,185" fill={theme === "warm" ? "#FEF08A" : "#1E293B"} stroke={strokeColor} strokeWidth="2.5" />
          <path d="M 65 165 L 80 185 L 95 165 M 80 185 L 80 205" stroke={strokeColor} strokeWidth="2" />

          {/* Spool at top */}
          <circle cx="80" cy="25" r="18" fill="#F43F5E" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="80" cy="25" r="7" fill={bgCardColor} stroke={strokeColor} strokeWidth="2" />
          <path d="M 95 25 Q 110 40 90 80" stroke="#F43F5E" strokeWidth="2.5" fill="none" />
        </svg>
      </div>

      {/* ─── RIGHT MIDDLE: Quadcopter Drone & Telemetry ────────────────────── */}
      <div
        className="absolute top-1/3 -right-4 md:-right-2 w-36 md:w-48 transition-transform duration-500 hover:scale-105"
        style={{ filter: shadowFilter }}
      >
        <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Cross Carbon Arms */}
          <line x1="30" y1="40" x2="170" y2="180" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" />
          <line x1="170" y1="40" x2="30" y2="180" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" />

          {/* 4 Motors & Propeller Discs */}
          {/* Top-Left Rotor */}
          <ellipse cx="30" cy="40" rx="32" ry="12" fill={theme === "warm" ? "#FEF08A" : "#38BDF8"} opacity="0.4" stroke={strokeColor} strokeWidth="1.5" className="animate-spin" />
          <circle cx="30" cy="40" r="8" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />

          {/* Top-Right Rotor */}
          <ellipse cx="170" cy="40" rx="32" ry="12" fill={theme === "warm" ? "#FEF08A" : "#38BDF8"} opacity="0.4" stroke={strokeColor} strokeWidth="1.5" className="animate-spin" />
          <circle cx="170" cy="40" r="8" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />

          {/* Bottom-Left Rotor */}
          <ellipse cx="30" cy="180" rx="32" ry="12" fill={theme === "warm" ? "#FEF08A" : "#38BDF8"} opacity="0.4" stroke={strokeColor} strokeWidth="1.5" className="animate-spin" />
          <circle cx="30" cy="180" r="8" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />

          {/* Bottom-Right Rotor */}
          <ellipse cx="170" cy="180" rx="32" ry="12" fill={theme === "warm" ? "#FEF08A" : "#38BDF8"} opacity="0.4" stroke={strokeColor} strokeWidth="1.5" className="animate-spin" />
          <circle cx="170" cy="180" r="8" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />

          {/* Center Drone Body Hub */}
          <rect x="70" y="80" width="60" height="60" rx="14" fill={bgCardColor} stroke={strokeColor} strokeWidth="3" />
          <circle cx="100" cy="110" r="14" fill={theme === "warm" ? "#F59E0B" : "#6366F1"} stroke={strokeColor} strokeWidth="2" />
          <circle cx="100" cy="110" r="6" fill="#0F172A" />

          {/* Navigation LEDs */}
          <circle cx="75" cy="85" r="3.5" fill="#EF4444" className="animate-ping" />
          <circle cx="125" cy="85" r="3.5" fill="#10B981" className="animate-ping" />

          {/* Antenna */}
          <line x1="100" y1="80" x2="100" y2="58" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="100" cy="55" r="4" fill="#F43F5E" />
        </svg>
      </div>

      {/* ─── BOTTOM LEFT: Digital Multimeter & Probes ───────────────────────── */}
      <div
        className="absolute -bottom-3 left-4 md:left-10 w-44 md:w-56 transition-transform duration-500 hover:scale-105"
        style={{ filter: shadowFilter }}
      >
        <svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Yellow Holster Body */}
          <rect x="25" y="15" width="115" height="120" rx="16" fill={theme === "warm" ? "#F59E0B" : "#EAB308"} stroke={strokeColor} strokeWidth="3" />
          <rect x="35" y="25" width="95" height="100" rx="10" fill={theme === "warm" ? "#1E293B" : "#0F172A"} stroke={strokeColor} strokeWidth="2" />

          {/* LCD Screen */}
          <rect x="45" y="35" width="75" height="32" rx="4" fill="#94A3B8" stroke={strokeColor} strokeWidth="1.5" />
          <rect x="47" y="37" width="71" height="28" rx="2" fill="#CBD5E1" />
          <text x="54" y="58" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily="monospace">5.00 V</text>

          {/* Dial Selector */}
          <circle cx="82" cy="88" r="16" fill="#475569" stroke={strokeColor} strokeWidth="2" />
          <line x1="82" y1="88" x2="82" y2="76" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />

          {/* Lead Sockets */}
          <circle cx="58" cy="112" r="5" fill="#EF4444" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="82" cy="112" r="5" fill="#0F172A" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="106" cy="112" r="5" fill="#3B82F6" stroke={strokeColor} strokeWidth="1.5" />

          {/* Curved Test Probes */}
          {/* Red Probe Wire */}
          <path d="M 58 117 C 58 145 160 140 180 100" stroke="#EF4444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <rect x="175" y="85" width="10" height="30" rx="3" fill="#EF4444" stroke={strokeColor} strokeWidth="1.5" transform="rotate(30 175 85)" />
          <line x1="192" y1="82" x2="208" y2="72" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Black Probe Wire */}
          <path d="M 82 117 C 82 155 180 150 205 115" stroke="#1E293B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <rect x="200" y="100" width="10" height="30" rx="3" fill="#1E293B" stroke={strokeColor} strokeWidth="1.5" transform="rotate(20 200 100)" />
          <line x1="214" y1="98" x2="228" y2="88" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ─── BOTTOM RIGHT: Microcontroller Board & Resistors ────────────────── */}
      <div
        className="absolute -bottom-3 right-4 md:right-10 w-44 md:w-60 transition-transform duration-500 hover:scale-105"
        style={{ filter: shadowFilter }}
      >
        <svg viewBox="0 0 260 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Blue PCB Board (Arduino / ESP32 Vibe) */}
          <rect x="30" y="20" width="180" height="110" rx="12" fill={theme === "warm" ? "#0284C7" : "#0369A1"} stroke={strokeColor} strokeWidth="3" />

          {/* Mounting Holes */}
          <circle cx="42" cy="32" r="4" fill={bgCardColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="198" cy="32" r="4" fill={bgCardColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="42" cy="118" r="4" fill={bgCardColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="198" cy="118" r="4" fill={bgCardColor} stroke={strokeColor} strokeWidth="1.5" />

          {/* USB-C Connector */}
          <rect x="10" y="55" width="24" height="40" rx="4" fill="#94A3B8" stroke={strokeColor} strokeWidth="2" />
          <rect x="12" y="63" width="10" height="24" rx="2" fill="#475569" />

          {/* Main MCU Chip */}
          <rect x="80" y="45" width="55" height="55" rx="6" fill="#1E293B" stroke={strokeColor} strokeWidth="2" />
          <circle cx="90" cy="55" r="3" fill="#F59E0B" />
          <text x="88" y="78" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">ESP32</text>

          {/* Wi-Fi Meander Antenna Trace */}
          <path d="M 180 40 L 195 40 L 195 48 L 185 48 L 185 56 L 195 56 L 195 64 L 180 64" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* GPIO Female Header Strip (Top & Bottom) */}
          <rect x="50" y="26" width="120" height="10" rx="2" fill="#0F172A" stroke={strokeColor} strokeWidth="1.5" />
          <rect x="50" y="114" width="120" height="10" rx="2" fill="#0F172A" stroke={strokeColor} strokeWidth="1.5" />

          {/* Breadboard Jumper Wires out to border */}
          <path d="M 70 26 Q 60 -10 10 10" stroke="#EF4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 90 26 Q 100 -10 140 0" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 110 26 Q 140 -5 180 5" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Resistor Component */}
          <g transform="translate(180, 85)">
            <line x1="0" y1="12" x2="50" y2="12" stroke="#CBD5E1" strokeWidth="2.5" />
            <rect x="12" y="4" width="26" height="16" rx="4" fill="#FEF08A" stroke={strokeColor} strokeWidth="1.5" />
            {/* Color Bands */}
            <line x1="17" y1="4" x2="17" y2="20" stroke="#EF4444" strokeWidth="2" />
            <line x1="22" y1="4" x2="22" y2="20" stroke="#3B82F6" strokeWidth="2" />
            <line x1="27" y1="4" x2="27" y2="20" stroke="#10B981" strokeWidth="2" />
            <line x1="32" y1="4" x2="32" y2="20" stroke="#F59E0B" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}
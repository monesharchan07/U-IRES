import { useState } from 'react'
import { Segmented } from '../ui/Controls'

function TopView() {
  return (
    <svg viewBox="0 0 360 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="mapglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,255,168,0.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <pattern id="campus-grid-pat" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(79,215,255,0.035)" strokeWidth="0.5" />
        </pattern>
        <filter id="glow-fx" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base background & grid */}
      <rect x="0" y="0" width="360" height="220" fill="rgba(4,9,15,0.78)" />
      <rect x="0" y="0" width="360" height="190" fill="url(#campus-grid-pat)" />

      {/* Landscaping / Green Areas */}
      <g>
        <path d="M 62 62 Q 80 50 96 66 Q 105 84 86 96 Q 66 94 62 62 Z" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.14)" strokeWidth="0.7" />
        <path d="M 230 18 Q 252 8 260 28 Q 250 48 232 40 Z" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.14)" strokeWidth="0.7" />
        <path d="M 18 138 Q 45 132 58 152 Q 48 174 24 168 Z" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.14)" strokeWidth="0.7" />
        <path d="M 276 86 Q 300 78 316 96 Q 306 114 282 108 Z" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.14)" strokeWidth="0.7" />

        {/* Tree clusters */}
        <circle cx="82" cy="74" r="5" fill="rgba(61,255,168,0.08)" stroke="rgba(61,255,168,0.22)" strokeWidth="0.6" />
        <circle cx="90" cy="82" r="4" fill="rgba(61,255,168,0.08)" stroke="rgba(61,255,168,0.22)" strokeWidth="0.6" />
        <circle cx="242" cy="26" r="5" fill="rgba(61,255,168,0.08)" stroke="rgba(61,255,168,0.22)" strokeWidth="0.6" />
        <circle cx="38" cy="154" r="5.5" fill="rgba(61,255,168,0.08)" stroke="rgba(61,255,168,0.22)" strokeWidth="0.6" />
        <circle cx="295" cy="98" r="5" fill="rgba(61,255,168,0.08)" stroke="rgba(61,255,168,0.22)" strokeWidth="0.6" />
      </g>

      {/* Pathways / Roads */}
      <g fill="none">
        <path d="M 0 92 C 55 92 85 82 110 95 S 190 102 240 88 S 310 95 360 85" stroke="rgba(79,215,255,0.15)" strokeWidth="1.1" strokeDasharray="3 3" />
        <path d="M 116 0 C 118 40 108 80 120 115 S 132 150 128 188" stroke="rgba(79,215,255,0.1)" strokeWidth="0.8" />
        <path d="M 248 0 C 242 35 255 75 240 110 S 230 150 236 188" stroke="rgba(79,215,255,0.1)" strokeWidth="0.8" />
      </g>

      {/* Surrounding Campus Buildings */}
      <g fill="rgba(120,200,170,0.03)" stroke="rgba(120,200,170,0.14)" strokeWidth="0.7">
        <rect x="270" y="15" width="54" height="26" rx="2.5" />
        <rect x="285" y="52" width="46" height="24" rx="2.5" />
        <rect x="332" y="80" width="20" height="34" rx="2" />
        <rect x="14" y="65" width="42" height="24" rx="2.5" />
        <rect x="14" y="100" width="46" height="28" rx="2.5" />
        <rect x="70" y="140" width="44" height="24" rx="2.5" />
        <rect x="140" y="155" width="54" height="20" rx="2.5" />
        <rect x="150" y="12" width="60" height="20" rx="2.5" />
      </g>

      {/* TECH BLOCK (Center) */}
      <g>
        <circle cx="180" cy="95" r="42" fill="url(#mapglow)" />
        <rect
          x="120"
          y="45"
          width="120"
          height="96"
          rx="6"
          fill="rgba(6,16,25,0.5)"
          stroke="rgba(61,255,168,0.28)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Tech Block internal wings layout */}
        <rect x="128" y="55" width="38" height="36" rx="3" fill="rgba(61,255,168,0.06)" stroke="rgba(61,255,168,0.22)" strokeWidth="0.8" />
        <rect x="166" y="65" width="28" height="18" rx="2" fill="rgba(79,215,255,0.05)" stroke="rgba(79,215,255,0.18)" strokeWidth="0.8" />
        <rect x="194" y="80" width="38" height="36" rx="3" fill="rgba(79,215,255,0.06)" stroke="rgba(79,215,255,0.22)" strokeWidth="0.8" />

        <text x="180" y="98" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="8" fontWeight="bold" fill="#3dffa8" opacity="0.9" letterSpacing="2">TECH BLOCK</text>
        <text x="180" y="108" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" opacity="0.7" letterSpacing="0.8">ACADEMIC &amp; RESEARCH</text>
      </g>

      {/* ZONE A (Top-Left / Wing 1) */}
      <g className="group cursor-pointer">
        {/* Leader line */}
        <line
          x1="90"
          y1="54"
          x2="136"
          y2="74"
          stroke="#3dffa8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.85"
          filter="url(#glow-fx)"
        />
        {/* Marker */}
        <circle cx="136" cy="74" r="5" fill="none" stroke="#3dffa8" strokeWidth="1.5" className="ping-ring" style={{ transformOrigin: '136px 74px' }} />
        <circle cx="136" cy="74" r="4.5" fill="#3dffa8" style={{ filter: 'drop-shadow(0 0 6px #3dffa8)' }} />
        <circle cx="136" cy="74" r="9" fill="none" stroke="#3dffa8" strokeOpacity="0.4" strokeWidth="1" />

        {/* Info Box */}
        <rect
          x="14"
          y="12"
          width="102"
          height="42"
          rx="5"
          fill="rgba(6,12,18,0.94)"
          stroke="#3dffa8"
          strokeWidth="1.2"
          strokeOpacity="0.8"
          style={{ filter: 'drop-shadow(0 0 10px rgba(61,255,168,0.22))' }}
        />
        <text x="22" y="24" fontFamily="Consolas, monospace" fontSize="8.5" fontWeight="bold" fill="#3dffa8" letterSpacing="1.5">ZONE A</text>
        <circle cx="106" cy="21" r="3" fill="#3dffa8" style={{ filter: 'drop-shadow(0 0 4px #3dffa8)' }} />
        <line x1="22" y1="28" x2="108" y2="28" stroke="#3dffa8" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="22" y="37" fontFamily="Consolas, monospace" fontSize="6.5" fill="#93a8b0" letterSpacing="0.5">Tech Block · Wing 1</text>
        <text x="22" y="47" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#3dffa8" letterSpacing="1">● ONLINE</text>
      </g>

      {/* ZONE B (Lower-Right / Wing 2) */}
      <g className="group cursor-pointer">
        {/* Leader line */}
        <line
          x1="224"
          y1="116"
          x2="268"
          y2="122"
          stroke="#4fd7ff"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.85"
          filter="url(#glow-fx)"
        />
        {/* Marker */}
        <circle cx="224" cy="116" r="5" fill="none" stroke="#4fd7ff" strokeWidth="1.5" className="ping-ring" style={{ transformOrigin: '224px 116px' }} />
        <circle cx="224" cy="116" r="4.5" fill="#4fd7ff" style={{ filter: 'drop-shadow(0 0 6px #4fd7ff)' }} />
        <circle cx="224" cy="116" r="9" fill="none" stroke="#4fd7ff" strokeOpacity="0.4" strokeWidth="1" />

        {/* Info Box */}
        <rect
          x="244"
          y="122"
          width="102"
          height="42"
          rx="5"
          fill="rgba(6,12,18,0.94)"
          stroke="#4fd7ff"
          strokeWidth="1.2"
          strokeOpacity="0.8"
          style={{ filter: 'drop-shadow(0 0 10px rgba(79,215,255,0.22))' }}
        />
        <text x="252" y="134" fontFamily="Consolas, monospace" fontSize="8.5" fontWeight="bold" fill="#4fd7ff" letterSpacing="1.5">ZONE B</text>
        <circle cx="336" cy="131" r="3" fill="#4fd7ff" style={{ filter: 'drop-shadow(0 0 4px #4fd7ff)' }} />
        <line x1="252" y1="138" x2="338" y2="138" stroke="#4fd7ff" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="252" y="147" fontFamily="Consolas, monospace" fontSize="6.5" fill="#93a8b0" letterSpacing="0.5">Tech Block · Wing 2</text>
        <text x="252" y="157" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#4fd7ff" letterSpacing="1">● ONLINE</text>
      </g>

      {/* 50 m scale (Bottom-Left) */}
      <g transform="translate(14, 178)">
        <line x1="0" y1="0" x2="28" y2="0" stroke="#78909c" strokeWidth="1" />
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#78909c" strokeWidth="1" />
        <line x1="28" y1="-2.5" x2="28" y2="2.5" stroke="#78909c" strokeWidth="1" />
        <text x="33" y="2.5" fontFamily="Consolas, monospace" fontSize="6.5" fill="#78909c">50 m</text>
      </g>

      {/* North Arrow (Bottom-Right) */}
      <g transform="translate(346, 176)">
        <path d="M0 -8 L3 3 L0 1.2 L-3 3 Z" fill="#93a8b0" stroke="#93a8b0" strokeWidth="0.4" />
        <text x="0" y="-10" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#93a8b0">N</text>
      </g>

      {/* Bottom Legend Bar */}
      <g>
        <line x1="10" y1="190" x2="350" y2="190" stroke="rgba(120,200,170,0.15)" strokeWidth="0.7" />
        <rect x="0" y="191" width="360" height="29" fill="rgba(3,7,12,0.88)" />

        {/* Legend item: Zone A */}
        <circle cx="16" cy="204" r="2.8" fill="#3dffa8" />
        <text x="23" y="202.5" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#3dffa8">ZONE A</text>
        <text x="23" y="210" fontFamily="Consolas, monospace" fontSize="4.8" fill="#78909c">WING 1</text>

        {/* Legend item: Zone B */}
        <circle cx="88" cy="204" r="2.8" fill="#4fd7ff" />
        <text x="95" y="202.5" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#4fd7ff">ZONE B</text>
        <text x="95" y="210" fontFamily="Consolas, monospace" fontSize="4.8" fill="#78909c">WING 2</text>

        {/* Legend item: Buildings */}
        <rect x="160" y="201" width="6.5" height="6.5" rx="1" fill="rgba(120,200,170,0.15)" stroke="rgba(120,200,170,0.5)" strokeWidth="0.7" />
        <text x="170" y="206.5" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" letterSpacing="0.4">BUILDINGS</text>

        {/* Legend item: Green Area */}
        <circle cx="236" cy="204.5" r="3" fill="rgba(61,255,168,0.25)" stroke="#3dffa8" strokeWidth="0.7" />
        <text x="243" y="206.5" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" letterSpacing="0.4">GREEN AREA</text>

        {/* Legend item: Pathways */}
        <line x1="300" y1="204.5" x2="312" y2="204.5" stroke="#4fd7ff" strokeWidth="0.9" strokeDasharray="2.5 1.5" />
        <text x="316" y="206.5" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" letterSpacing="0.4">PATHWAYS</text>
      </g>
    </svg>
  )
}

function IsoView() {
  return (
    <svg viewBox="0 0 360 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="iso-techglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,255,168,0.22)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="iso-aglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,255,168,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="iso-bglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(79,215,255,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <pattern id="iso-grid" width="20" height="12" patternUnits="userSpaceOnUse">
          <path d="M 0 6 L 10 0 L 20 6 L 10 12 Z" fill="none" stroke="rgba(79,215,255,0.03)" strokeWidth="0.5" />
        </pattern>
        <filter id="iso-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground plane & terrain */}
      <rect x="0" y="0" width="360" height="220" fill="rgba(4,9,15,0.85)" />
      <rect x="0" y="0" width="360" height="190" fill="url(#iso-grid)" />

      {/* Isometric Green Lawns */}
      <g>
        <polygon points="50,45 100,20 120,40 70,65" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.15)" strokeWidth="0.7" />
        <polygon points="220,25 260,10 275,25 235,40" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.15)" strokeWidth="0.7" />
        <polygon points="20,135 65,115 80,130 35,150" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.15)" strokeWidth="0.7" />
        <polygon points="270,120 315,100 330,115 285,135" fill="rgba(61,255,168,0.04)" stroke="rgba(61,255,168,0.15)" strokeWidth="0.7" />
      </g>

      {/* Isometric Roads & Pathways */}
      <g fill="none">
        <path d="M 10 135 L 140 65 L 250 125 L 360 65" stroke="rgba(79,215,255,0.16)" strokeWidth="2.5" />
        <path d="M 10 135 L 140 65 L 250 125 L 360 65" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="3 3" />
        <path d="M 122 108 L 180 138 L 238 126" stroke="rgba(61,255,168,0.2)" strokeWidth="1.2" strokeDasharray="2 2" />
        <path d="M 60 92 L 122 122" stroke="rgba(79,215,255,0.12)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 238 146 L 300 115" stroke="rgba(79,215,255,0.12)" strokeWidth="1" strokeDasharray="2 2" />
      </g>

      {/* 3D Isometric Trees (conical geometry with cast shadows) */}
      <g>
        {/* Tree 1 */}
        <ellipse cx="75" cy="46" rx="5" ry="2.5" fill="rgba(0,0,0,0.5)" />
        <polygon points="75,28 81,42 69,42" fill="rgba(61,255,168,0.22)" stroke="#3dffa8" strokeWidth="0.6" />
        <polygon points="75,28 75,42 69,42" fill="rgba(61,255,168,0.35)" />
        {/* Tree 2 */}
        <ellipse cx="92" cy="54" rx="4.5" ry="2.2" fill="rgba(0,0,0,0.5)" />
        <polygon points="92,38 97,49 87,49" fill="rgba(61,255,168,0.22)" stroke="#3dffa8" strokeWidth="0.6" />
        <polygon points="92,38 92,49 87,49" fill="rgba(61,255,168,0.35)" />
        {/* Tree 3 */}
        <ellipse cx="245" cy="28" rx="4.5" ry="2.2" fill="rgba(0,0,0,0.5)" />
        <polygon points="245,14 251,25 239,25" fill="rgba(61,255,168,0.22)" stroke="#3dffa8" strokeWidth="0.6" />
        {/* Tree 4 */}
        <ellipse cx="48" cy="142" rx="4.5" ry="2.2" fill="rgba(0,0,0,0.5)" />
        <polygon points="48,128 54,139 42,139" fill="rgba(61,255,168,0.22)" stroke="#3dffa8" strokeWidth="0.6" />
        {/* Tree 5 */}
        <ellipse cx="300" cy="128" rx="4.5" ry="2.2" fill="rgba(0,0,0,0.5)" />
        <polygon points="300,114 306,125 294,125" fill="rgba(61,255,168,0.22)" stroke="#3dffa8" strokeWidth="0.6" />
      </g>

      {/* Surrounding Background 3D Campus Buildings */}
      <g>
        {/* Top-Right Tower (Library) */}
        <g>
          {/* Left Wall */}
          <polygon points="258,32 280,44 280,72 258,60" fill="rgba(10,20,30,0.85)" stroke="rgba(120,200,170,0.2)" strokeWidth="0.7" />
          {/* Right Wall */}
          <polygon points="280,44 302,32 302,60 280,72" fill="rgba(6,14,22,0.92)" stroke="rgba(120,200,170,0.2)" strokeWidth="0.7" />
          {/* Roof */}
          <polygon points="280,20 302,32 280,44 258,32" fill="rgba(18,34,48,0.9)" stroke="rgba(120,200,170,0.3)" strokeWidth="0.8" />
          {/* Illuminated windows */}
          <line x1="264" y1="42" x2="274" y2="48" stroke="rgba(79,215,255,0.7)" strokeWidth="1" />
          <line x1="264" y1="50" x2="274" y2="56" stroke="rgba(79,215,255,0.7)" strokeWidth="1" />
          <line x1="286" y1="48" x2="296" y2="42" stroke="rgba(255,180,84,0.6)" strokeWidth="1" />
          <line x1="286" y1="56" x2="296" y2="50" stroke="rgba(79,215,255,0.7)" strokeWidth="1" />
        </g>

        {/* Top-Center Building (Science Hub) */}
        <g>
          <polygon points="158,40 180,52 180,70 158,58" fill="rgba(10,20,30,0.85)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="180,52 202,40 202,58 180,70" fill="rgba(6,14,22,0.9)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="180,28 202,40 180,52 158,40" fill="rgba(16,30,42,0.88)" stroke="rgba(120,200,170,0.25)" strokeWidth="0.7" />
          <line x1="164" y1="48" x2="174" y2="54" stroke="rgba(79,215,255,0.5)" strokeWidth="0.8" />
          <line x1="186" y1="54" x2="196" y2="48" stroke="rgba(79,215,255,0.5)" strokeWidth="0.8" />
        </g>

        {/* Far-Left Building (Hostel) */}
        <g>
          <polygon points="42,82 60,92 60,110 42,100" fill="rgba(10,20,30,0.85)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="60,92 78,82 78,100 60,110" fill="rgba(6,14,22,0.9)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="60,72 78,82 60,92 42,82" fill="rgba(16,30,42,0.88)" stroke="rgba(120,200,170,0.25)" strokeWidth="0.7" />
        </g>

        {/* Bottom-Left Arena (Auditorium) */}
        <g>
          <polygon points="64,144 90,159 90,172 64,157" fill="rgba(10,20,30,0.85)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="90,159 116,144 116,157 90,172" fill="rgba(6,14,22,0.9)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="90,129 116,144 90,159 64,144" fill="rgba(16,30,42,0.88)" stroke="rgba(120,200,170,0.25)" strokeWidth="0.7" />
        </g>

        {/* Bottom-Right Complex (Admin) */}
        <g>
          <polygon points="290,94 310,105 310,125 290,114" fill="rgba(10,20,30,0.85)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="310,105 330,94 330,114 310,125" fill="rgba(6,14,22,0.9)" stroke="rgba(120,200,170,0.18)" strokeWidth="0.6" />
          <polygon points="310,83 330,94 310,105 290,94" fill="rgba(16,30,42,0.88)" stroke="rgba(120,200,170,0.25)" strokeWidth="0.7" />
        </g>
      </g>

      {/* CENTRAL TECH BLOCK COMPLEX */}
      <g>
        {/* Ambient glow */}
        <circle cx="180" cy="115" r="48" fill="url(#iso-techglow)" />

        {/* Podium Base Level */}
        <polygon points="144,118 180,138 180,150 144,130" fill="rgba(8,18,28,0.95)" stroke="rgba(61,255,168,0.25)" strokeWidth="0.8" />
        <polygon points="180,138 216,118 216,130 180,150" fill="rgba(5,12,20,0.98)" stroke="rgba(61,255,168,0.25)" strokeWidth="0.8" />
        <polygon points="180,98 216,118 180,138 144,118" fill="rgba(12,26,38,0.92)" stroke="rgba(61,255,168,0.3)" strokeWidth="0.8" />

        {/* Upper Spine Tower */}
        <polygon points="154,104 180,119 180,138 154,123" fill="rgba(9,22,33,0.95)" stroke="rgba(61,255,168,0.4)" strokeWidth="0.9" />
        <polygon points="180,119 206,104 206,123 180,138" fill="rgba(6,15,24,0.98)" stroke="rgba(61,255,168,0.4)" strokeWidth="0.9" />
        <polygon points="180,89 206,104 180,119 154,104" fill="rgba(15,35,48,0.95)" stroke="#3dffa8" strokeWidth="1.2" style={{ filter: 'drop-shadow(0 0 8px rgba(61,255,168,0.3))' }} />

        {/* Roof Glass Skylight */}
        <polygon points="180,95 198,105 180,115 162,105" fill="rgba(61,255,168,0.18)" stroke="#3dffa8" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* Illuminated windows on Tech Block */}
        <line x1="160" y1="112" x2="174" y2="120" stroke="rgba(61,255,168,0.9)" strokeWidth="1.2" />
        <line x1="160" y1="118" x2="174" y2="126" stroke="rgba(79,215,255,0.8)" strokeWidth="1.2" />
        <line x1="186" y1="120" x2="200" y2="112" stroke="rgba(61,255,168,0.9)" strokeWidth="1.2" />
        <line x1="186" y1="126" x2="200" y2="118" stroke="rgba(79,215,255,0.8)" strokeWidth="1.2" />

        {/* Central Tech Block Label */}
        <text x="180" y="156" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="8" fontWeight="bold" fill="#3dffa8" opacity="0.95" letterSpacing="2">TECH BLOCK</text>
        <text x="180" y="165" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" opacity="0.75" letterSpacing="0.8">ACADEMIC &amp; RESEARCH</text>
      </g>

      {/* ZONE A 3D BUILDING & HUD (Upper-Left / Wing 1) */}
      <g className="group cursor-pointer">
        {/* Glow */}
        <circle cx="122" cy="84" r="28" fill="url(#iso-aglow)" />

        {/* Left Wall */}
        <polygon points="98,84 122,98 122,122 98,108" fill="rgba(9,22,33,0.95)" stroke="#3dffa8" strokeOpacity="0.65" strokeWidth="1" />
        {/* Right Wall */}
        <polygon points="122,98 146,84 146,108 122,122" fill="rgba(6,15,24,0.98)" stroke="#3dffa8" strokeOpacity="0.65" strokeWidth="1" />
        {/* Roof */}
        <polygon points="122,70 146,84 122,98 98,84" fill="rgba(14,32,44,0.95)" stroke="#3dffa8" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 10px rgba(61,255,168,0.4))' }} />

        {/* Roof Sensor Ring */}
        <ellipse cx="122" cy="84" rx="14" ry="7" fill="none" stroke="#3dffa8" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* Illuminated windows */}
        <line x1="104" y1="92" x2="116" y2="99" stroke="#3dffa8" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #3dffa8)' }} />
        <line x1="104" y1="99" x2="116" y2="106" stroke="#3dffa8" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #3dffa8)' }} />
        <line x1="128" y1="99" x2="140" y2="92" stroke="#4fd7ff" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #4fd7ff)' }} />
        <line x1="128" y1="106" x2="140" y2="99" stroke="#3dffa8" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #3dffa8)' }} />

        {/* Zone A Marker on Roof */}
        <circle cx="122" cy="84" r="5" fill="none" stroke="#3dffa8" strokeWidth="1.5" className="ping-ring" style={{ transformOrigin: '122px 84px' }} />
        <circle cx="122" cy="84" r="4.5" fill="#3dffa8" style={{ filter: 'drop-shadow(0 0 7px #3dffa8)' }} />

        {/* Leader line to HUD Box */}
        <line x1="90" y1="54" x2="122" y2="84" stroke="#3dffa8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" filter="url(#iso-glow)" />

        {/* Zone A HUD Info Box */}
        <rect
          x="14"
          y="12"
          width="102"
          height="42"
          rx="5"
          fill="rgba(6,12,18,0.94)"
          stroke="#3dffa8"
          strokeWidth="1.2"
          strokeOpacity="0.8"
          style={{ filter: 'drop-shadow(0 0 10px rgba(61,255,168,0.25))' }}
        />
        <text x="22" y="24" fontFamily="Consolas, monospace" fontSize="8.5" fontWeight="bold" fill="#3dffa8" letterSpacing="1.5">ZONE A</text>
        <circle cx="106" cy="21" r="3" fill="#3dffa8" style={{ filter: 'drop-shadow(0 0 4px #3dffa8)' }} />
        <line x1="22" y1="28" x2="108" y2="28" stroke="#3dffa8" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="22" y="37" fontFamily="Consolas, monospace" fontSize="6.5" fill="#93a8b0" letterSpacing="0.5">Tech Block · Wing 1</text>
        <text x="22" y="47" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#3dffa8" letterSpacing="1">● ONLINE</text>
      </g>

      {/* ZONE B 3D BUILDING & HUD (Lower-Right / Wing 2) */}
      <g className="group cursor-pointer">
        {/* Glow */}
        <circle cx="238" cy="112" r="28" fill="url(#iso-bglow)" />

        {/* Left Wall */}
        <polygon points="214,112 238,126 238,148 214,134" fill="rgba(9,22,33,0.95)" stroke="#4fd7ff" strokeOpacity="0.65" strokeWidth="1" />
        {/* Right Wall */}
        <polygon points="238,126 262,112 262,134 238,148" fill="rgba(6,15,24,0.98)" stroke="#4fd7ff" strokeOpacity="0.65" strokeWidth="1" />
        {/* Roof */}
        <polygon points="238,98 262,112 238,126 214,112" fill="rgba(14,32,44,0.95)" stroke="#4fd7ff" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 10px rgba(79,215,255,0.4))' }} />

        {/* Roof Sensor Ring */}
        <ellipse cx="238" cy="112" rx="14" ry="7" fill="none" stroke="#4fd7ff" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* Illuminated windows */}
        <line x1="220" y1="120" x2="232" y2="127" stroke="#4fd7ff" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #4fd7ff)' }} />
        <line x1="220" y1="127" x2="232" y2="134" stroke="#4fd7ff" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #4fd7ff)' }} />
        <line x1="244" y1="127" x2="256" y2="120" stroke="#3dffa8" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #3dffa8)' }} />
        <line x1="244" y1="134" x2="256" y2="127" stroke="#4fd7ff" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 3px #4fd7ff)' }} />

        {/* Zone B Marker on Roof */}
        <circle cx="238" cy="112" r="5" fill="none" stroke="#4fd7ff" strokeWidth="1.5" className="ping-ring" style={{ transformOrigin: '238px 112px' }} />
        <circle cx="238" cy="112" r="4.5" fill="#4fd7ff" style={{ filter: 'drop-shadow(0 0 7px #4fd7ff)' }} />

        {/* Leader line to HUD Box */}
        <line x1="238" y1="112" x2="268" y2="122" stroke="#4fd7ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" filter="url(#iso-glow)" />

        {/* Zone B HUD Info Box */}
        <rect
          x="244"
          y="122"
          width="102"
          height="42"
          rx="5"
          fill="rgba(6,12,18,0.94)"
          stroke="#4fd7ff"
          strokeWidth="1.2"
          strokeOpacity="0.8"
          style={{ filter: 'drop-shadow(0 0 10px rgba(79,215,255,0.25))' }}
        />
        <text x="252" y="134" fontFamily="Consolas, monospace" fontSize="8.5" fontWeight="bold" fill="#4fd7ff" letterSpacing="1.5">ZONE B</text>
        <circle cx="336" cy="131" r="3" fill="#4fd7ff" style={{ filter: 'drop-shadow(0 0 4px #4fd7ff)' }} />
        <line x1="252" y1="138" x2="338" y2="138" stroke="#4fd7ff" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="252" y="147" fontFamily="Consolas, monospace" fontSize="6.5" fill="#93a8b0" letterSpacing="0.5">Tech Block · Wing 2</text>
        <text x="252" y="157" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#4fd7ff" letterSpacing="1">● ONLINE</text>
      </g>

      {/* 50 m scale (Bottom-Left) */}
      <g transform="translate(14, 178)">
        <line x1="0" y1="0" x2="28" y2="0" stroke="#78909c" strokeWidth="1" />
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#78909c" strokeWidth="1" />
        <line x1="28" y1="-2.5" x2="28" y2="2.5" stroke="#78909c" strokeWidth="1" />
        <text x="33" y="2.5" fontFamily="Consolas, monospace" fontSize="6.5" fill="#78909c">50 m</text>
      </g>

      {/* North Arrow (Bottom-Right) */}
      <g transform="translate(346, 176)">
        <path d="M0 -8 L3 3 L0 1.2 L-3 3 Z" fill="#93a8b0" stroke="#93a8b0" strokeWidth="0.4" />
        <text x="0" y="-10" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#93a8b0">N</text>
      </g>

      {/* ISO Projection Tag (Upper-Right) */}
      <g transform="translate(348, 18)">
        <text x="0" y="0" textAnchor="end" fontFamily="Consolas, monospace" fontSize="6" fill="#5c7078" letterSpacing="1">ISO PROJECTION</text>
        <text x="0" y="8" textAnchor="end" fontFamily="Consolas, monospace" fontSize="5" fill="#5c7078" opacity="0.8">RENDER: DIGITAL TWIN</text>
      </g>

      {/* Bottom Legend Bar */}
      <g>
        <line x1="10" y1="190" x2="350" y2="190" stroke="rgba(120,200,170,0.15)" strokeWidth="0.7" />
        <rect x="0" y="191" width="360" height="29" fill="rgba(3,7,12,0.88)" />

        {/* Legend item: Zone A */}
        <circle cx="16" cy="204" r="2.8" fill="#3dffa8" />
        <text x="23" y="202.5" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#3dffa8">ZONE A</text>
        <text x="23" y="210" fontFamily="Consolas, monospace" fontSize="4.8" fill="#78909c">WING 1</text>

        {/* Legend item: Zone B */}
        <circle cx="88" cy="204" r="2.8" fill="#4fd7ff" />
        <text x="95" y="202.5" fontFamily="Consolas, monospace" fontSize="6" fontWeight="bold" fill="#4fd7ff">ZONE B</text>
        <text x="95" y="210" fontFamily="Consolas, monospace" fontSize="4.8" fill="#78909c">WING 2</text>

        {/* Legend item: Buildings */}
        <rect x="160" y="201" width="6.5" height="6.5" rx="1" fill="rgba(120,200,170,0.15)" stroke="rgba(120,200,170,0.5)" strokeWidth="0.7" />
        <text x="170" y="206.5" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" letterSpacing="0.4">BUILDINGS</text>

        {/* Legend item: Green Area */}
        <circle cx="236" cy="204.5" r="3" fill="rgba(61,255,168,0.25)" stroke="#3dffa8" strokeWidth="0.7" />
        <text x="243" y="206.5" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" letterSpacing="0.4">GREEN AREA</text>

        {/* Legend item: Pathways */}
        <line x1="300" y1="204.5" x2="312" y2="204.5" stroke="#4fd7ff" strokeWidth="0.9" strokeDasharray="2.5 1.5" />
        <text x="316" y="206.5" fontFamily="Consolas, monospace" fontSize="5.5" fill="#93a8b0" letterSpacing="0.4">PATHWAYS</text>
      </g>
    </svg>
  )
}

export default function CampusMapPanel() {
  const [view, setView] = useState('top')
  return (
    <section className="glass hud-corners flex flex-col flex-1">
      <span className="corner-br" />
      <header className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h3 className="label-cap !tracking-[0.24em]">Campus Map</h3>
        <Segmented value={view} onChange={setView} options={[{ value: 'top', label: 'TOP VIEW' }, { value: 'iso', label: '3D VIEW' }]} size="xs" />
      </header>
      <div className="px-3 pb-3 flex-1 min-h-[190px] rounded-xl overflow-hidden relative">
        <div className="scanline" />
        {view === 'top' ? <TopView /> : <IsoView />}
      </div>
    </section>
  )
}

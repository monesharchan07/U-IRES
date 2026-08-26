import { useState } from 'react'
import { ZONES } from '../../mock/mockData'
import { Segmented } from '../ui/Controls'

function TopView() {
  return (
    <svg viewBox="0 0 260 170" className="w-full h-full">
      <defs>
        <radialGradient id="mapglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,255,168,0.14)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="260" height="170" fill="rgba(4,9,14,.5)" />
      <g stroke="rgba(79,215,255,0.14)" strokeWidth="1" fill="none">
        <path d="M0 118 C60 108 90 128 130 120 S210 96 260 106" />
        <path d="M84 0 C92 40 76 80 88 118 S110 160 104 170" />
      </g>
      <g fill="rgba(120,200,170,0.055)" stroke="rgba(120,200,170,0.14)" strokeWidth="0.7">
        <rect x="18" y="18" width="44" height="30" rx="3" />
        <rect x="150" y="14" width="52" height="26" rx="3" />
        <rect x="212" y="52" width="34" height="38" rx="3" />
        <rect x="24" y="128" width="38" height="26" rx="3" />
        <rect x="168" y="132" width="56" height="22" rx="3" />
      </g>
      <rect x="70" y="42" width="86" height="66" rx="6" fill="rgba(61,255,168,0.05)" stroke="rgba(61,255,168,0.35)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="113" y="98" textAnchor="middle" fontFamily="Consolas, monospace" fontSize="7.5" fill="#3dffa8" opacity="0.75" letterSpacing="2">TECH BLOCK</text>
      <circle cx="130" cy="85" r="46" fill="url(#mapglow)" />
      {ZONES.map((z) => {
        const color = z.id === 'A' ? '#3dffa8' : '#4fd7ff'
        const cx = (z.map.x / 100) * 260
        const cy = (z.map.y / 100) * 170
        return (
          <g key={z.id} className="group cursor-pointer">
            <circle cx={cx} cy={cy} r="4" fill="none" stroke={color} strokeWidth="1" className="ping-ring" style={{ transformOrigin: `${cx}px ${cy}px` }} />
            <circle cx={cx} cy={cy} r="5.5" fill={color} opacity="0.95" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            <circle cx={cx} cy={cy} r="10" fill="none" stroke={color} strokeOpacity="0.4" />
            <text x={cx + 13} y={cy - 4} fontFamily="Consolas, monospace" fontSize="9" fontWeight="bold" fill="#e9f5ef" letterSpacing="1.5">{z.name.toUpperCase()}</text>
            <text x={cx + 13} y={cy + 6} fontFamily="Consolas, monospace" fontSize="6.5" fill="#93a8b0">{z.location}</text>
          </g>
        )
      })}
      <g transform="translate(236,146)">
        <path d="M0 -11 L3.5 4 L0 1.5 L-3.5 4 Z" fill="none" stroke="#93a8b0" strokeWidth="0.8" />
        <text x="0" y="-13" textAnchor="middle" fontFamily="Consolas" fontSize="6" fill="#93a8b0">N</text>
      </g>
      <g transform="translate(12,158)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#5c7078" strokeWidth="1" />
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#5c7078" strokeWidth="1" />
        <line x1="30" y1="-2.5" x2="30" y2="2.5" stroke="#5c7078" strokeWidth="1" />
        <text x="35" y="2.5" fontFamily="Consolas" fontSize="6.5" fill="#5c7078">50 m</text>
      </g>
    </svg>
  )
}

function IsoView() {
  return (
    <svg viewBox="0 0 280 180" className="w-full h-full">
      <defs>
        <radialGradient id="iso-A" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(61,255,168,0.2)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="iso-B" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(79,215,255,0.2)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <g transform="translate(0,-6)">
        {ZONES.map((z) => {
          const color = z.id === 'A' ? '#3dffa8' : '#4fd7ff'
          const ox = z.iso.x
          const oy = z.iso.y
          return (
            <g key={z.id}>
              <polygon points={`${ox},${oy} ${ox + 58},${oy - 20} ${ox + 58},${oy + 26} ${ox},${oy + 46}`} fill={`${color}16`} stroke={color} strokeOpacity="0.55" strokeWidth="1" />
              <polygon points={`${ox},${oy} ${ox + 58},${oy - 20} ${ox + 92},${oy - 4} ${ox + 34},${oy + 16}`} fill={`${color}22`} stroke={color} strokeOpacity="0.65" strokeWidth="1" />
              <polygon points={`${ox + 34},${oy + 16} ${ox + 92},${oy - 4} ${ox + 92},${oy + 42} ${ox + 34},${oy + 62}`} fill={`${color}10`} stroke={color} strokeOpacity="0.45" strokeWidth="1" />
              <ellipse cx={ox + 46} cy={oy + 30} rx="40" ry="16" fill={`url(#iso-${z.id})`} opacity="0.5" />
              <text x={ox + 29} y={oy + 36} textAnchor="middle" fontFamily="Consolas, monospace" fontWeight="bold" fontSize="10" fill="#e9f5ef" letterSpacing="2">ZONE {z.id}</text>
              <circle cx={ox + 29} cy={oy - 26} r="3.5" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            </g>
          )
        })}
        <g stroke="rgba(79,215,255,0.25)" strokeWidth="0.8" strokeDasharray="4 6" fill="none">
          <path d="M117 116 L196 148" />
        </g>
        <text x="228" y="30" fontFamily="Consolas" fontSize="7" fill="#5c7078" letterSpacing="1.5">ISO PROJECTION</text>
        <text x="228" y="40" fontFamily="Consolas" fontSize="6.5" fill="#5c7078" opacity="0.7">RENDER: WIREFRAME</text>
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

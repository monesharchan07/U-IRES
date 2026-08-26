const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ size = 16, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      {children}
    </svg>
  )
}

export const IconGrid = (p) => (
  <Svg {...p}><path d="M3.5 3.5h7v7h-7zM13.5 3.5h7v7h-7zM3.5 13.5h7v7h-7zM13.5 13.5h7v7h-7z" /></Svg>
)

export const IconCube = (p) => (
  <Svg {...p}><path d="M12 2.8l8 4.4v9.6l-8 4.4-8-4.4V7.2z" /><path d="M12 12l8-4.4M12 12L4 7.6M12 12v9.2" /></Svg>
)

export const IconEye = (p) => (
  <Svg {...p}><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></Svg>
)

export const IconLayers = (p) => (
  <Svg {...p}><path d="M12 3.5l9 5-9 5-9-5z" /><path d="M3 13.5l9 5 9-5" /></Svg>
)

export const IconBrain = (p) => (
  <Svg {...p}><path d="M9.5 4.5a2.6 2.6 0 0 0-2.6 2.6c-1.7.4-2.9 1.8-2.9 3.6 0 1 .4 1.9 1 2.6-.4.6-.6 1.3-.6 2a3.4 3.4 0 0 0 3.4 3.4c.5 1 1.5 1.7 2.7 1.7 1.1 0 2-.6 2.5-1.4V4.9c-.5-.5-1.4-.4-3.5-.4z" /><path d="M14.5 4.5a2.6 2.6 0 0 1 2.6 2.6c1.7.4 2.9 1.8 2.9 3.6 0 1-.4 1.9-1 2.6.4.6.6 1.3.6 2a3.4 3.4 0 0 1-3.4 3.4c-.5 1-1.5 1.7-2.7 1.7" /></Svg>
)

export const IconFlask = (p) => (
  <Svg {...p}><path d="M9.5 3.5h5M10.5 3.5v5.2L4.9 18.2a1.6 1.6 0 0 0 1.4 2.4h11.4a1.6 1.6 0 0 0 1.4-2.4L13.5 8.7V3.5" /><path d="M7.5 14.5h9" /></Svg>
)

export const IconCpu = (p) => (
  <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="10" y="10" width="4" height="4" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></Svg>
)

export const IconBolt = (p) => (
  <Svg {...p}><path d="M13 2.5L4.5 13.5H11l-1 8L19.5 10H13z" /></Svg>
)

export const IconSliders = (p) => (
  <Svg {...p}><path d="M4 8h10M18 8h2M4 16h4M12 16h8" /><circle cx="16" cy="8" r="2" /><circle cx="10" cy="16" r="2" /></Svg>
)

export const IconTarget = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></Svg>
)

export const IconActivity = (p) => (
  <Svg {...p}><path d="M3 12h4l2.5-6.5L14 18l2.5-6H21" /></Svg>
)

export const IconBell = (p) => (
  <Svg {...p}><path d="M6 9.5a6 6 0 0 1 12 0c0 4.4 1.6 5.6 1.6 5.6H4.4S6 13.9 6 9.5z" /><path d="M10 18.6a2.1 2.1 0 0 0 4 0" /></Svg>
)

export const IconUsers = (p) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2M17.5 14.8c1.8.7 3 2.2 3 4.2" /></Svg>
)

export const IconThermo = (p) => (
  <Svg {...p}><path d="M10 4.5a2 2 0 0 1 4 0v8.6a4.4 4.4 0 1 1-4 0z" /><path d="M12 10v6" /><circle cx="12" cy="17" r="1.4" fill="currentColor" /></Svg>
)

export const IconDrop = (p) => (
  <Svg {...p}><path d="M12 3.5s6 6.6 6 10.7a6 6 0 0 1-12 0C6 10.1 12 3.5 12 3.5z" /></Svg>
)

export const IconWifi = (p) => (
  <Svg {...p}><path d="M3.5 9.5a12.5 12.5 0 0 1 17 0M6.5 13a8.2 8.2 0 0 1 11 0M9.5 16.4a4 4 0 0 1 5 0" /><circle cx="12" cy="19.4" r="1" fill="currentColor" stroke="none" /></Svg>
)

export const IconFan = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="1.6" /><path d="M12 10.4c0-3 .8-5.9-1.4-6.9-1.8-.8-3.6.4-3.4 2.2.2 2 2.6 3.4 4.8 4.7zM13.6 12c3 0 5.9.8 6.9-1.4.8-1.8-.4-3.6-2.2-3.4-2 .2-3.4 2.6-4.7 4.8zM12 13.6c0 3-.8 5.9 1.4 6.9 1.8.8 3.6-.4 3.4-2.2-.2-2-2.6-3.4-4.8-4.7zM10.4 12c-3 0-5.9-.8-6.9 1.4-.8 1.8.4 3.6 2.2 3.4 2-.2 3.4-2.6 4.7-4.8z" /></Svg>
)

export const IconBulb = (p) => (
  <Svg {...p}><path d="M9 18c0-2.5-3-3.5-3-7a6 6 0 0 1 12 0c0 3.5-3 4.5-3 7z" /><path d="M9.5 21h5" /></Svg>
)

export const IconZap = (p) => (
  <Svg {...p}><path d="M8 2.8v6.4H4.5L11 21.2v-7h4z" /></Svg>
)

export const IconExpand = (p) => (
  <Svg {...p}><path d="M9 3.5H3.5V9M15 3.5h5.5V9M9 20.5H3.5V15M15 20.5h5.5V15" /></Svg>
)

export const IconClose = (p) => (
  <Svg {...p}><path d="M5.5 5.5l13 13M18.5 5.5l-13 13" /></Svg>
)

export const IconCheck = (p) => (
  <Svg {...p}><path d="M4.5 12.5l5 5 10-11" /></Svg>
)

export const IconAlert = (p) => (
  <Svg {...p}><path d="M12 3.5L2.5 20h19z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.2" r="0.4" fill="currentColor" /></Svg>
)

export const IconInfo = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><circle cx="12" cy="8" r="0.4" fill="currentColor" /></Svg>
)

export const IconArrowUp = (p) => (
  <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>
)

export const IconArrowDown = (p) => (
  <Svg {...p}><path d="M12 5v14M18 13l-6 6-6-6" /></Svg>
)

export const IconArrowRight = (p) => (
  <Svg {...p}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></Svg>
)

export const IconPin = (p) => (
  <Svg {...p}><path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5z" /><circle cx="12" cy="10" r="2.6" /></Svg>
)

export const IconRefresh = (p) => (
  <Svg {...p}><path d="M20 5.5v5h-5" /><path d="M19.4 10.5A8 8 0 1 0 12 20a8 8 0 0 0 7-4.1" /></Svg>
)

export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.2l3.4 2" /></Svg>
)

export const IconMap = (p) => (
  <Svg {...p}><path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z" /><path d="M9 4.5v13M15 6.5v13" /></Svg>
)

export const IconShield = (p) => (
  <Svg {...p}><path d="M12 2.8l7.5 2.8v6.2c0 4.8-3.2 8-7.5 9.4-4.3-1.4-7.5-4.6-7.5-9.4V5.6z" /><path d="M9 11.8l2.2 2.2 4-4.4" /></Svg>
)

export const IconChart = (p) => (
  <Svg {...p}><path d="M3.5 3.5v17h17" /><path d="M7.5 15.5v-4M12 15.5v-8M16.5 15.5v-6" /></Svg>
)

export const IconNode = (p) => (
  <Svg {...p}><rect x="9" y="2.8" width="6" height="6" rx="1.4" /><rect x="2.5" y="15.2" width="6" height="6" rx="1.4" /><rect x="15.5" y="15.2" width="6" height="6" rx="1.4" /><path d="M12 8.8v3.4M5.5 15.2v-3h13v3" /></Svg>
)

export const IconMenu = (p) => (
  <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
)

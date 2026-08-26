import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as campusService from '../services/campusService'
import { applyAction as svcApplyAction, resumeAutomation as svcResume } from '../services/actionService'
import {
  INITIAL_NOTIFICATIONS,
  METRIC_KEYS,
  NOTIFICATION_POOL,
  ZONES,
} from '../mock/mockData'

const StoreContext = createContext(null)

let notifSeq = 0

export function AppStoreProvider({ children }) {
  const [activePage, setActivePage] = useState('overview')
  const [selectedZone, setSelectedZone] = useState('all')
  const [zones, setZones] = useState(null)
  const [buffers, setBuffers] = useState(() => campusService.seedLiveBuffers(5))
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [toasts, setToasts] = useState([])
  const [lastActions, setLastActions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const tickCount = useRef(0)
  const bootedRef = useRef(false)

  useEffect(() => {
    let alive = true
    campusService.fetchZones().then((z) => {
      if (alive && !bootedRef.current) {
        setZones(z)
        bootedRef.current = true
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const pushToast = useCallback((toast) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5600)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((n) => {
    notifSeq += 1
    const item = {
      id: `n-${Date.now()}-${notifSeq}`,
      severity: n.severity || 'info',
      title: n.title,
      message: n.message,
      ts: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [item, ...prev].slice(0, 24))
    if (n.toast !== false) pushToast({ severity: item.severity, title: item.title, message: item.message })
    return item
  }, [pushToast])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  const applyDeviceStates = useCallback((zoneId, deviceStates) => {
    setZones((prev) => {
      if (!prev || !prev[zoneId]) return prev
      const z = { ...prev[zoneId], actuator: { ...prev[zoneId].actuator } }
      for (const d of deviceStates) {
        z.actuator[d.device] = d.state
      }
      return { ...prev, [zoneId]: z }
    })
  }, [])

  const runAction = useCallback(async ({ zoneId, label, deviceStates, source }) => {
    const res = await svcApplyAction({ zoneId, label, deviceStates, source })
    if (res.success) {
      applyDeviceStates(zoneId, deviceStates)
      setLastActions((prev) => [res.record, ...prev].slice(0, 10))
      notify({
        severity: 'success',
        title: 'Action applied',
        message: res.message,
      })
    }
    return res
  }, [applyDeviceStates, notify])

  const resumeAutomation = useCallback(async (zoneId) => {
    setZones((prev) => (prev ? { ...prev, [zoneId]: { ...prev[zoneId], mode: 'AUTO' } } : prev))
    const res = await svcResume(zoneId)
    notify({ severity: 'success', title: 'Automation resumed', message: res.message })
    return res
  }, [notify])

  const engageManualMode = useCallback((zoneId) => {
    setZones((prev) => (prev ? { ...prev, [zoneId]: { ...prev[zoneId], mode: 'MANUAL' } } : prev))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setZones((prev) => {
        if (!prev) return prev
        const next = {}
        for (const z of ZONES) next[z.id] = campusService.tickZone(prev[z.id])
        return next
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!zones) return
    const now = Date.now()
    setBuffers((prev) => {
      const next = {}
      for (const z of ZONES) {
        next[z.id] = campusService.appendLivePoint(prev[z.id], zones[z.id], now)
      }
      return next
    })
    tickCount.current += 1
    const tc = tickCount.current
    if (tc > 2 && tc % 14 === 0) {
      const poolItem = NOTIFICATION_POOL[(tc / 14 - 1) % NOTIFICATION_POOL.length]
      notify({ ...poolItem, toast: false })
    }
    if (tc === 3) {
      const hot = Object.values(zones).find((z) => z.temperature >= 27)
      if (hot) {
        notify({
          severity: 'warn',
          title: 'Threshold watch',
          message: `${hot.id === 'A' ? 'Zone A' : 'Zone B'} temperature trending ${hot.temperature.toFixed(1)} °C — predicted to exceed threshold.`,
          toast: false,
        })
      }
    }
  }, [zones, notify])

  const resourceIndicators = useMemo(
    () => (zones ? campusService.getResourceIndicators(zones) : null),
    [zones],
  )

  const value = useMemo(() => ({
    activePage,
    setActivePage,
    selectedZone,
    setSelectedZone,
    zones,
    buffers,
    resourceIndicators,
    notifications,
    toasts,
    lastActions,
    sidebarOpen,
    setSidebarOpen,
    notify,
    markAllRead,
    clearNotifications,
    dismissToast,
    runAction,
    resumeAutomation,
    engageManualMode,
  }), [
    activePage, selectedZone, zones, buffers, resourceIndicators, notifications, toasts,
    lastActions, sidebarOpen, notify, markAllRead, clearNotifications, dismissToast,
    runAction, resumeAutomation, engageManualMode,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider')
  return ctx
}

export { METRIC_KEYS }

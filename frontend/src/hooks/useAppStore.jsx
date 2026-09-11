import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as campusService from '../services/campusService'
import { applyAction as svcApplyAction, resumeAutomation as svcResume } from '../services/actionService'
import {
  INITIAL_NOTIFICATIONS,
  METRIC_KEYS,
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
  const bootedRef = useRef(false)
  const esRef = useRef(null)

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

  useEffect(() => {
    const es = new EventSource('/api/events?zone=A,B')
    esRef.current = es

    es.addEventListener('telemetry.updated', (e) => {
      try {
        const data = JSON.parse(e.data)
        setZones((prev) => {
          if (!prev || !prev[data.zoneId]) return prev
          const zone = prev[data.zoneId]
          const occupancy = data.occupancy ?? zone.occupancy
          const networkHealth = data.networkHealth ?? zone.networkHealth
          return {
            ...prev,
            [data.zoneId]: {
              ...zone,
              temperature: data.temperature ?? zone.temperature,
              humidity: data.humidity ?? zone.humidity,
              occupancy,
              occupancyLevel: occupancy >= 5 ? 'High' : 'Low',
              networkHealth,
              network: networkHealth >= 80 ? 'Good' : networkHealth >= 50 ? 'Fair' : 'Weak',
              estimatedPower: data.estimatedPower ?? zone.estimatedPower,
              connection: 'online',
              lastUpdate: data.timestamp,
            },
          }
        })
      } catch (err) {
        console.warn('[SSE] Failed to parse telemetry.updated:', err)
      }
    })

    es.addEventListener('action.created', (e) => {
      try {
        const data = JSON.parse(e.data)
        const primary = data.deviceStates?.[0]
        setLastActions((prev) => [{
          id: data.actionId,
          ts: data.executedAt,
          zoneId: data.zoneId,
          label: data.label,
          deviceStates: data.deviceStates,
          source: data.source,
          status: data.status,
          device: primary?.device,
          state: primary?.state,
        }, ...prev].slice(0, 10))
      } catch (err) {
        console.warn('[SSE] Failed to parse action.created:', err)
      }
    })

    return () => {
      es.close()
      esRef.current = null
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
      setLastActions((prev) => [res.record, ...prev].slice(0, 10))
      notify({
        severity: 'success',
        title: 'Action applied',
        message: res.message,
      })
    }
    return res
  }, [notify])

  const resumeAutomation = useCallback(async (zoneId) => {
    setZones((prev) => (prev ? { ...prev, [zoneId]: { ...prev[zoneId], mode: 'AUTO' } } : prev))
    const res = await svcResume(zoneId)
    notify({ severity: 'success', title: 'Automation resumed', message: res.message })
    return res
  }, [notify])

  const engageManualMode = useCallback((zoneId) => {
    setZones((prev) => (prev ? { ...prev, [zoneId]: { ...prev[zoneId], mode: 'MANUAL' } } : prev))
  }, [])

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

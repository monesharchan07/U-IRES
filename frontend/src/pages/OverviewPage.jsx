import ZoneCard from '../components/overview/ZoneCard'
import DataOverviewPanel from '../components/overview/DataOverviewPanel'
import CampusMapPanel from '../components/overview/CampusMapPanel'
import ResourceIndicatorsPanel from '../components/overview/ResourceIndicatorsPanel'
import StructureOverviewPanel from '../components/overview/StructureOverviewPanel'
import MainTrendPanel from '../components/overview/MainTrendPanel'

export default function OverviewPage() {
  return (
    <div className="space-y-3 rise-in">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3">
          <ZoneCard zoneId="A" />
          <ZoneCard zoneId="B" />
        </div>
        <aside className="xl:col-span-3 flex flex-col gap-3">
          <DataOverviewPanel />
          <CampusMapPanel />
        </aside>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
        <div className="xl:col-span-4 min-w-0">
          <ResourceIndicatorsPanel />
        </div>
        <div className="xl:col-span-5 min-w-0 min-h-[280px]">
          <MainTrendPanel />
        </div>
        <div className="xl:col-span-3 min-w-0 min-h-[280px]">
          <StructureOverviewPanel />
        </div>
      </div>
    </div>
  )
}

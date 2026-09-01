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
        <div className="xl:col-span-4 min-w-0">
          <ZoneCard zoneId="A" />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <ZoneCard zoneId="B" />
        </div>
        <div className="xl:col-span-4 min-w-0 flex">
          <DataOverviewPanel />
        </div>

        <div className="xl:col-span-6 min-w-0">
          <ResourceIndicatorsPanel />
        </div>
        <div className="xl:col-span-6 min-w-0">
          <CampusMapPanel />
        </div>

        <div className="xl:col-span-6 min-w-0 min-h-[280px]">
          <MainTrendPanel />
        </div>
        <div className="xl:col-span-6 min-w-0 min-h-[280px]">
          <StructureOverviewPanel />
        </div>
      </div>
    </div>
  )
}

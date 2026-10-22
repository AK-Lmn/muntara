import { Accessibility, Car, Clock, DoorOpen, Info } from 'lucide-react'
import type { AccessInfo } from '@/types'

const WHEELCHAIR_LABEL: Record<AccessInfo['wheelchairAccess'], string> = {
  yes: 'Wheelchair accessible',
  no: 'Not wheelchair accessible',
  partial: 'Partially wheelchair accessible',
  unknown: 'Wheelchair access not yet confirmed',
}

interface AccessInfoPanelProps {
  access: AccessInfo
}

export function AccessInfoPanel({ access }: AccessInfoPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Entrance & access</h3>

      <div className="flex gap-2.5 text-sm text-slate-700">
        <DoorOpen size={18} className="mt-0.5 shrink-0 text-slate-400" />
        <p>{access.entranceNotes}</p>
      </div>

      <div className="flex gap-2.5 text-sm text-slate-700">
        <Accessibility size={18} className="mt-0.5 shrink-0 text-slate-400" />
        <p className={access.wheelchairAccess === 'unknown' ? 'italic text-slate-500' : undefined}>
          {WHEELCHAIR_LABEL[access.wheelchairAccess]}
        </p>
      </div>

      {access.parkingNotes && (
        <div className="flex gap-2.5 text-sm text-slate-700">
          <Car size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <p>{access.parkingNotes}</p>
        </div>
      )}

      {access.hoursNote && (
        <div className="flex gap-2.5 text-sm text-slate-700">
          <Clock size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <p>{access.hoursNote}</p>
        </div>
      )}

      {access.additionalNotes && (
        <div className="flex gap-2.5 text-sm text-slate-700">
          <Info size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <p>{access.additionalNotes}</p>
        </div>
      )}
    </div>
  )
}

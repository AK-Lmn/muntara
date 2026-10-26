import { Accessibility, Car, Clock, DoorOpen, Info } from 'lucide-react'
import type { AccessInfo } from '@/types'

const WHEELCHAIR_LABEL: Record<AccessInfo['wheelchairAccess'], string> = {
  yes: 'Wheelchair accessible',
  no: 'Not wheelchair accessible',
  partial: 'Partially wheelchair accessible',
  unknown: 'Not confirmed',
}

interface AccessInfoPanelProps {
  access: AccessInfo
}

export function AccessInfoPanel({ access }: AccessInfoPanelProps) {
  const details = [
    { label: 'Entrance', icon: DoorOpen, value: access.entranceNotes },
    { label: 'Wheelchair access', icon: Accessibility, value: WHEELCHAIR_LABEL[access.wheelchairAccess] },
    { label: 'Parking', icon: Car, value: access.parkingNotes },
    { label: 'Opening hours', icon: Clock, value: access.hoursNote },
    { label: 'Other access notes', icon: Info, value: access.additionalNotes },
  ]

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby="access-heading">
      <h2 id="access-heading" className="font-semibold text-slate-900">Entrance & access</h2>
      <dl className="space-y-3">
        {details.map(({ label, icon: Icon, value }) => (
          <div key={label} className="flex gap-2.5 text-sm text-slate-700">
            <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <dt className="font-medium text-slate-800">{label}</dt>
              <dd className={!value || value === 'Not confirmed' ? 'text-slate-500' : undefined}>
                {value || 'Not confirmed'}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

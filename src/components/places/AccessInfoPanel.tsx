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
    <section className="space-y-4 border-t border-line pt-6" aria-labelledby="access-heading">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Planning a visit</p>
        <h2 id="access-heading" className="mt-1 text-xl font-bold text-ink">Entrance and access</h2>
      </div>
      <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {details.map(({ label, icon: Icon, value }) => (
          <div key={label} className="flex gap-3 text-sm">
            <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
            <div className="min-w-0">
              <dt className="font-semibold text-ink">{label}</dt>
              <dd className="mt-1 text-copy">{value || 'Not confirmed'}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { CATEGORY_META } from './categoryMeta'
import type { Place } from '@/types'

interface PlaceCardProps {
  place: Place
  highlighted?: boolean
}

export function PlaceCard({ place, highlighted }: PlaceCardProps) {
  const { label, icon: Icon } = CATEGORY_META[place.category]
  const hasOfficialSource = place.sources.some((source) => source.sourceType === 'official')
  const hasFieldVisit = place.sources.some((source) => source.sourceType === 'field_visit')

  return (
    <Card interactive className={highlighted ? 'ring-2 ring-brand-400' : undefined}>
      <Link to={`/places/${place.id}`} className="block p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug text-slate-900">{place.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
              <MapPin size={12} aria-hidden="true" />{place.barangay} · {label}
            </p>
          </div>
        </div>
        <p className="mt-2.5 line-clamp-2 text-sm text-slate-600">{place.description || 'Details: Not confirmed'}</p>
        <p className="mt-1 text-xs text-slate-600">Address: {place.address || 'Not confirmed'}</p>
        {!place.location && <p className="mt-1 text-xs text-slate-500">Map location: Not confirmed</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <VerificationBadge state={place.verification.state} />
          {place.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{tag}</span>)}
        </div>
        {hasOfficialSource && <p className="mt-2 text-xs text-slate-600">Official source checked</p>}
        {hasFieldVisit && <p className="mt-1 text-xs text-slate-600">In-person evidence available; see checked fields</p>}
      </Link>
    </Card>
  )
}

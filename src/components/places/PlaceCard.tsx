import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { CATEGORY_META } from './categoryMeta'
import type { Place } from '@/types'

interface PlaceCardProps {
  place: Place
  highlighted?: boolean
}

export function PlaceCard({ place, highlighted }: PlaceCardProps) {
  const { label, icon: Icon } = CATEGORY_META[place.category]
  return (
    <Link to={`/places/${place.id}`} aria-label={`View ${place.name} details`}
      className={`group grid min-h-28 grid-cols-[2.75rem_minmax(0,1fr)_1.5rem] items-start gap-3 rounded-lg py-5 transition-colors hover:bg-surface active:bg-surface-soft sm:px-3 ${highlighted ? 'bg-surface ring-2 ring-brand-300' : ''}`}>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
            <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-ink group-hover:text-brand-800">{place.name}</h3>
            <VerificationBadge state={place.verification.state} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-copy">
            <MapPin size={14} aria-hidden="true" className="shrink-0 text-muted" />
            <span>{place.barangay} · {label}</span>
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-copy">{place.services[0] || place.description || 'Service details not confirmed'}</p>
          <p className="mt-2 text-sm text-muted">{place.address || 'Street address not confirmed'}</p>
        </div>
        <ArrowUpRight size={18} aria-hidden="true" className="mt-1 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}

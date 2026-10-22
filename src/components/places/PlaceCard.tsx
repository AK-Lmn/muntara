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

  return (
    <Card
      interactive
      className={highlighted ? 'ring-2 ring-brand-400' : undefined}
    >
      <Link to={`/places/${place.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold leading-snug text-slate-900">{place.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                {place.barangay} · {label}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm text-slate-600">{place.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <VerificationBadge state={place.verification.state} />
          {place.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </Card>
  )
}

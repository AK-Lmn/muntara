import {
  Landmark,
  Stethoscope,
  GraduationCap,
  Bus,
  UtensilsCrossed,
  Trees,
  Church,
  ShoppingBag,
  Siren,
  BedDouble,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import type { PlaceCategory } from '@/types'

interface CategoryMeta {
  label: string
  icon: LucideIcon
}

export const CATEGORY_META: Record<PlaceCategory, CategoryMeta> = {
  government: { label: 'Government', icon: Landmark },
  health: { label: 'Health', icon: Stethoscope },
  education: { label: 'Education', icon: GraduationCap },
  transport: { label: 'Transport', icon: Bus },
  food: { label: 'Food', icon: UtensilsCrossed },
  park_recreation: { label: 'Parks & recreation', icon: Trees },
  worship: { label: 'Worship', icon: Church },
  shopping: { label: 'Shopping', icon: ShoppingBag },
  emergency_services: { label: 'Emergency services', icon: Siren },
  lodging: { label: 'Lodging', icon: BedDouble },
  other: { label: 'Other', icon: MapPin },
}

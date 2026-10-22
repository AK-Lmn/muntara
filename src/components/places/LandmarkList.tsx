import { Landmark as LandmarkIcon } from 'lucide-react'
import type { Landmark } from '@/types'

interface LandmarkListProps {
  landmarks: Landmark[]
}

export function LandmarkList({ landmarks }: LandmarkListProps) {
  if (landmarks.length === 0) {
    return <p className="text-sm italic text-slate-500">No nearby landmarks recorded yet.</p>
  }

  return (
    <ul className="space-y-2">
      {landmarks.map((landmark) => (
        <li key={landmark.name} className="flex items-start gap-2.5 text-sm text-slate-700">
          <LandmarkIcon size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <span>
            <span className="font-medium">{landmark.name}</span>
            <span className="text-slate-500"> — {landmark.relativePosition}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

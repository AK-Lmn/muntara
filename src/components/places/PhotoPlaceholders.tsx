import { ImageOff, ImagePlus } from 'lucide-react'

interface PhotoPlaceholdersProps {
  count: number
}

/**
 * Prototype has no real photo upload/storage pipeline, so this renders
 * clearly-labeled placeholder tiles instead of pretending images exist.
 */
export function PhotoPlaceholders({ count }: PhotoPlaceholdersProps) {
  if (count === 0) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-line-strong px-4 py-6 text-sm text-muted">
        <ImageOff size={18} />
        No photos yet
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line-strong bg-canvas text-faint"
        >
          <ImagePlus size={18} />
          <span className="text-caption font-medium">Photo placeholder</span>
        </div>
      ))}
    </div>
  )
}

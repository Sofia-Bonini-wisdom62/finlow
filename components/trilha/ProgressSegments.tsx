"use client"

interface Props {
  total: number
  atual: number
}

export function ProgressSegments({ total, atual }: Props) {
  return (
    <div className="flex gap-1.5 px-4 pt-4 pb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 overflow-hidden rounded-full bg-[#1A2B3C]"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              i < atual
                ? "w-full bg-[#00C896]"
                : i === atual
                ? "w-full bg-white/80"
                : "w-0"
            }`}
          />
        </div>
      ))}
    </div>
  )
}

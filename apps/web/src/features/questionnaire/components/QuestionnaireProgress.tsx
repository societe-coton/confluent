export interface QuestionnaireProgressProps {
  position: number
  total: number
}

export function QuestionnaireProgress({
  position,
  total,
}: QuestionnaireProgressProps) {
  const percent = Math.round((position / total) * 100)
  return (
    <div
      aria-hidden="true"
      className="h-[3px] w-full overflow-hidden rounded-full bg-border"
    >
      <div
        className="h-full bg-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

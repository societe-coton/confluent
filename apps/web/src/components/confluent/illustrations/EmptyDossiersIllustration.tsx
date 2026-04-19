export function EmptyDossiersIllustration() {
  return (
    <svg
      width={96}
      height={96}
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Folder tab */}
      <path d="M14 28 L40 28 L46 34 L82 34" />
      {/* Folder body */}
      <path d="M14 28 L14 74 C14 76 16 78 18 78 L78 78 C80 78 82 76 82 74 L82 34" />
      {/* Inner sheet outline (suggests an empty document) */}
      <rect x={30} y={46} width={36} height={24} rx={2} />
      {/* "+" badge indicating "add new" */}
      <circle cx={72} cy={24} r={8} />
      <path d="M72 20 L72 28" />
      <path d="M68 24 L76 24" />
    </svg>
  )
}

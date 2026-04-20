export function stripNonPrintable(value: string): string {
  return value.replace(
    // eslint-disable-next-line no-control-regex -- stripping C0 controls is the intent
    /[\u0000-\u001F\u007F\u00AD\u200B-\u200D\u2066-\u2069\u202A-\u202E\uFEFF]/g,
    '',
  )
}

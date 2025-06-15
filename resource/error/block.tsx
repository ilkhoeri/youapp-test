type ErrorMessage = string | number | unknown | null | undefined;

/** @example <ErrorBlock title="Detail" content={new Error("Something bad happened")} /> */
export function ErrorBlock({ title, content }: { title: string; content: ErrorMessage }) {
  if (!content || content === 'undefined') return null;

  let displayValue: string | number;

  if (typeof content === 'string' || typeof content === 'number') {
    displayValue = content;
  } else if (content instanceof Error) {
    displayValue = content.stack || content.message;
  } else if (typeof content === 'object') {
    try {
      displayValue = JSON.stringify(content, null, 2); // pretty-print object
    } catch {
      displayValue = '[Object with circular reference]';
    }
  } else {
    displayValue = String(content); // fallback
  }

  return (
    <section className="rounded-md bg-muted/20 pl-4 pt-2 pb-1 font-mono text-sm text-[--palette-text-secondary] whitespace-pre-wrap break-words">
      <strong className="block mb-1.5">{title}:</strong>
      <div className="max-h-80 overflow-y-auto pr-4 pb-3">{displayValue}</div>
    </section>
  );
}

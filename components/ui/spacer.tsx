/** Reserved for shared UI primitives (e.g. after adding a component library). */
export function Spacer({ className }: { className?: string }) {
  return <div className={className} aria-hidden />;
}

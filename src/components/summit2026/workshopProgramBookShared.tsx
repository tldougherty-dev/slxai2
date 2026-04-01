import { User } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Blue banner + white body: matches CoSET program book sections.
 */
export function WorkshopProgramSectionCard({
  headingId,
  title,
  children,
}: {
  headingId: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={headingId}>
      <div className="overflow-hidden rounded-lg border-2 border-electric-blue shadow-xl">
        <div className="bg-electric-blue px-4 py-3 text-center sm:px-6 sm:py-4">
          <h2 id={headingId} className="text-xl font-bold leading-tight text-white sm:text-2xl">
            {title}
          </h2>
        </div>
        <div className="border-t border-electric-blue/30 bg-white px-4 py-4 text-left sm:px-6 sm:py-5">{children}</div>
      </div>
    </section>
  );
}

export function WorkshopPresenterBioPlaceholder({ name }: { name: string }) {
  return (
    <div
      className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 text-center text-gray-500 shadow-inner sm:h-32 sm:w-32"
      role="img"
      aria-label={`Bio photo placeholder for ${name}`}
    >
      <User className="mb-1 h-9 w-9 opacity-55" aria-hidden />
      <span className="text-[10px] font-medium leading-tight sm:text-xs">Bio photo</span>
    </div>
  );
}

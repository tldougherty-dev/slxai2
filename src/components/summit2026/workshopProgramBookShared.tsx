import { Mail, User } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Renders optional [label](url) segments in bio text as external links (trusted program-book copy). */
function PresenterBioText({ text }: { text: string }) {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const segments: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let linkKey = 0;
  while ((m = linkPattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push(text.slice(lastIndex, m.index));
    }
    const href = m[2].trim();
    segments.push(
      <a
        key={`bio-link-${linkKey++}`}
        href={href}
        className="font-medium text-electric-blue underline underline-offset-2 hover:opacity-90"
        target="_blank"
        rel="noopener noreferrer"
      >
        {m[1]}
      </a>,
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }
  const children = segments.length > 0 ? segments : text;
  return (
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{children}</p>
  );
}

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

const presenterPhotoFrameClasses = {
  default: 'h-28 w-28 sm:h-32 sm:w-32',
  compact: 'h-20 w-20 sm:h-24 sm:w-24',
} as const;

export type WorkshopPresenterPhotoSize = keyof typeof presenterPhotoFrameClasses;

export function WorkshopPresenterBioPlaceholder({
  name,
  size = 'default',
}: {
  name: string;
  size?: WorkshopPresenterPhotoSize;
}) {
  const frame = presenterPhotoFrameClasses[size];
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/80 p-2 text-center text-gray-500 shadow-inner',
        frame,
      )}
      role="img"
      aria-label={`Bio photo placeholder for ${name}`}
    >
      <User className={cn('mb-1 opacity-55', size === 'compact' ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-9 w-9')} aria-hidden />
      <span
        className={cn(
          'font-medium leading-tight',
          size === 'compact' ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs',
        )}
      >
        Bio photo
      </span>
    </div>
  );
}

/** Program book presenter headshot: same frame as the placeholder; falls back when `photoUrl` is missing. */
export function WorkshopPresenterPhotoOrPlaceholder({
  name,
  photoUrl,
  imgClassName,
  size = 'default',
}: {
  name: string;
  photoUrl?: string | null;
  /** Merged into the image `className` for object-position / scale (tighter face crops). */
  imgClassName?: string;
  size?: WorkshopPresenterPhotoSize;
}) {
  const src = photoUrl?.trim();
  const frame = presenterPhotoFrameClasses[size];
  if (src) {
    return (
      <div
        className={cn(
          'shrink-0 overflow-hidden rounded-xl border-2 border-gray-200/90 bg-gray-100 shadow-inner',
          frame,
        )}
      >
        <img
          src={src}
          alt={`Portrait of ${name}`}
          className={cn(
            'h-full w-full origin-center object-cover',
            imgClassName ?? 'object-[center_18%]',
          )}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }
  return <WorkshopPresenterBioPlaceholder name={name} size={size} />;
}

/** Presenter bio block: image floats left; name, org, email, and bio wrap beside and under the photo. */
export type WorkshopPresenterBioCardProps = {
  name: string;
  photoUrl?: string | null;
  photoImgClassName?: string;
  title?: string;
  organization?: string;
  email?: string;
  bio?: string;
};

export function WorkshopPresenterBioCard({
  name,
  photoUrl,
  photoImgClassName,
  title,
  organization,
  email,
  bio,
}: WorkshopPresenterBioCardProps) {
  return (
    <article className="flow-root rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 shadow-md transition-shadow hover:border-electric-blue/25 hover:shadow-lg sm:p-5">
      <div className="float-left mb-2 mr-4">
        <WorkshopPresenterPhotoOrPlaceholder name={name} photoUrl={photoUrl} imgClassName={photoImgClassName} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{name}</h3>
      {title ? <p className="mt-1 text-sm text-gray-700">{title}</p> : null}
      {organization ? (
        <p className="mt-1 break-words text-sm text-electric-blue">
          <em className="font-semibold italic">{organization}</em>
        </p>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}`}
          className="mt-2 inline-flex min-w-0 items-center gap-1.5 break-all text-sm text-gray-600 transition-colors hover:text-electric-blue"
        >
          <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          {email}
        </a>
      ) : null}
      {bio ? <PresenterBioText text={bio} /> : null}
    </article>
  );
}

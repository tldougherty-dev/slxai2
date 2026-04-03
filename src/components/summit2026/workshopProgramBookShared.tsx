import { Mail, User } from 'lucide-react';
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

/** Program book presenter headshot: same frame as the placeholder; falls back when `photoUrl` is missing. */
export function WorkshopPresenterPhotoOrPlaceholder({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string | null;
}) {
  const src = photoUrl?.trim();
  if (src) {
    return (
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-gray-200/90 bg-gray-100 shadow-inner sm:h-32 sm:w-32">
        <img
          src={src}
          alt={`Portrait of ${name}`}
          className="h-full w-full object-cover object-[center_18%]"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }
  return <WorkshopPresenterBioPlaceholder name={name} />;
}

/** Presenter bio block: image floats left; name, org, email, and bio wrap beside and under the photo. */
export type WorkshopPresenterBioCardProps = {
  name: string;
  photoUrl?: string | null;
  title?: string;
  organization?: string;
  email?: string;
  bio?: string;
};

export function WorkshopPresenterBioCard({
  name,
  photoUrl,
  title,
  organization,
  email,
  bio,
}: WorkshopPresenterBioCardProps) {
  return (
    <article className="flow-root rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 shadow-md transition-shadow hover:border-electric-blue/25 hover:shadow-lg sm:p-5">
      <div className="float-left mb-2 mr-4">
        <WorkshopPresenterPhotoOrPlaceholder name={name} photoUrl={photoUrl} />
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
      {bio ? (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{bio}</p>
      ) : null}
    </article>
  );
}

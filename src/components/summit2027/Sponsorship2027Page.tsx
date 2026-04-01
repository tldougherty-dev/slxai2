import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ADD_ON_OPPORTUNITIES,
  AUDIENCE_CATEGORIES,
  CONTACT_EMAIL,
  EXHIBIT_LEVELS,
  SUMMIT_2027_DATES,
  SPONSORSHIP_TIERS,
  WHY_SPONSOR_POINTS,
  type TierId,
} from '@/components/summit2027/summit2027SponsorshipData';
import {
  Building2,
  Check,
  Globe2,
  Eye,
  IdCard,
  Landmark,
  Link2,
  Mail,
  MapPin,
  Plane,
  Presentation,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react';

const mailto = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

/** Title chip for Why sponsor cards */
const SPONSORSHIP_SECTION_TITLE_PILL_CLASS =
  'inline-flex max-w-full items-center justify-center rounded-full border border-orange-200/90 bg-white px-3 py-1.5 text-center text-sm font-semibold leading-snug tracking-tight text-slate-900 shadow-sm sm:px-4 sm:text-base';

/** Who you reach: same pill shape as Why sponsor, no outer box — tinted fill instead of white */
const AUDIENCE_CATEGORY_PILL_CLASS =
  'inline-flex w-full max-w-full items-center justify-center rounded-full border border-teal-200/75 bg-teal-50/85 px-3 py-1.5 text-center text-sm font-semibold leading-snug tracking-tight text-slate-800 shadow-sm sm:px-4 sm:text-base';

/** Top banner on each sponsorship tier card */
const TIER_TOP_BANNERS: Record<TierId, { label: string; barClass: string }> = {
  title: {
    label: 'Exclusive: 1 sponsor only',
    barClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600',
  },
  platinum: {
    label: 'Limited: 3 sponsors only',
    barClass: 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700',
  },
  gold: {
    label: 'Limited: 10 sponsors only',
    barClass: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500',
  },
  silver: {
    label: 'Limited: 15 sponsors only',
    barClass: 'bg-gradient-to-r from-slate-500 to-slate-700',
  },
};

/** Remaining/total copy for the small availability boxes (same tier order as cards) */
const TIER_AVAILABILITY_STATS: Record<TierId, { fraction: string; caption: string }> = {
  title: { fraction: '1/1', caption: 'Spots remaining' },
  platinum: { fraction: '2/3', caption: 'Spots remaining' },
  gold: { fraction: '8/10', caption: 'Spots remaining' },
  silver: { fraction: '14/15', caption: 'Spots remaining' },
};

const SPOT_BOX_BODY_BG: Record<TierId, string> = {
  title: 'bg-gradient-to-br from-orange-50 to-amber-50/70',
  platinum: 'bg-gradient-to-br from-blue-50 to-sky-100/50',
  gold: 'bg-gradient-to-br from-yellow-50 to-amber-50/50',
  silver: 'bg-gradient-to-br from-slate-100 to-slate-200/40',
};

const SPOT_BOX_BORDER: Record<TierId, string> = {
  title: 'border-orange-200/90',
  platinum: 'border-blue-200/90',
  gold: 'border-yellow-200/85',
  silver: 'border-slate-300/70',
};

/** Spot box + tier card share a parent `group`; hover either to sync */
const SPOT_BOX_GROUP_HOVER: Record<TierId, string> = {
  title: 'group-hover:border-orange-300/80 group-hover:shadow-lg',
  platinum: 'group-hover:border-blue-300/70 group-hover:shadow-md',
  gold: 'group-hover:border-yellow-300/70 group-hover:shadow-md',
  silver: 'group-hover:border-slate-400/70 group-hover:shadow-md',
};

const SPOT_BOX_FRACTION_CLASS: Record<TierId, string> = {
  title: 'text-orange-950',
  platinum: 'text-blue-950',
  gold: 'text-amber-950',
  silver: 'text-slate-700',
};

const SPOT_BOX_CAPTION_CLASS: Record<TierId, string> = {
  title: 'text-orange-900/85',
  platinum: 'text-blue-900/85',
  gold: 'text-yellow-900/85',
  silver: 'text-slate-600',
};

const TIER_IDS_ORDER: TierId[] = ['title', 'platinum', 'gold', 'silver'];

/** Short labels for the small availability boxes above the tier cards (same gradients as tier banners) */
const TIER_SPOT_HEADER_LABEL: Record<TierId, string> = {
  title: 'Title',
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
};

/** Matches order of ADD_ON_OPPORTUNITIES */
const ADD_ON_ICONS = [Sparkles, UtensilsCrossed, UtensilsCrossed, IdCard, Link2, Wifi] as const;

/** Ocean Drive-inspired accent bars (Miami: teal, coral, sunset, Biscayne) */
const ADD_ON_TOP_GRADIENTS = [
  'from-orange-400 via-rose-500 to-fuchsia-600',
  'from-cyan-400 via-teal-500 to-emerald-700',
  'from-amber-400 via-orange-500 to-rose-600',
  'from-sky-400 to-cyan-700',
  'from-teal-500 to-cyan-900',
  'from-emerald-400 to-teal-700',
] as const;

/** Miami palette: gradient bar + shell for exhibit cards */
const MIAMI_HEADLINE_CARD_STYLES = [
  {
    barClass: 'bg-gradient-to-r from-teal-500 via-cyan-600 to-emerald-600',
    shell:
      'border-cyan-200/85 bg-gradient-to-br from-cyan-50/90 to-teal-50/50 hover:border-cyan-300/70 hover:shadow-md',
  },
  {
    barClass: 'bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-600',
    shell:
      'border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50/45 hover:border-orange-300/70 hover:shadow-md',
  },
  {
    barClass: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-700',
    shell:
      'border-sky-200/85 bg-gradient-to-br from-sky-50 to-cyan-50/50 hover:border-sky-300/70 hover:shadow-md',
  },
  {
    barClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600',
    shell:
      'border-rose-200/70 bg-gradient-to-br from-rose-50/70 via-orange-50/35 to-amber-50/50 hover:border-rose-300/60 hover:shadow-md',
  },
] as const;

/** Mid-page section headings (~5% under prior 2.25 / 2.8125rem scale) */
const MIDPAGE_SECTION_TITLE_CLASS =
  'font-broadway text-center text-[2.1375rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.671875rem]';

export function Sponsorship2027Page() {
  return (
    <main
      id="main-content"
      className="relative text-slate-900 !bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_38%,#fffbeb_100%)] bg-white"
    >
      {/* Soft Miami “sun on water” wash behind page content */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.45]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 120% 80% at 100% 0%, rgba(251, 146, 60, 0.12), transparent 55%), radial-gradient(ellipse 90% 60% at 0% 100%, rgba(6, 182, 212, 0.14), transparent 50%)',
        }}
        aria-hidden
      />
      {/* Hero: Miami sunset skyline + overlays for legible white text */}
      <section
        className="relative flex min-h-[22rem] items-end overflow-hidden border-b border-teal-200/40 text-white sm:min-h-[28rem] md:min-h-[32rem]"
        aria-labelledby="sponsor-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-[center_30%] bg-no-repeat sm:bg-center"
          style={{ backgroundImage: "url('/summit2027-hero-miami.png')" }}
          aria-hidden
        />
        {/* Base darkening + warm Miami sunset cast */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/90 via-cyan-950/75 to-slate-950/95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-950/45 via-black/10 to-cyan-950/30"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 85% 55% at 50% 12%, rgba(34,211,238,0.32), transparent 58%), radial-gradient(ellipse 65% 50% at 92% 28%, rgba(251,146,60,0.18), transparent 55%), radial-gradient(ellipse 55% 45% at 8% 55%, rgba(244,114,182,0.12), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6 md:pb-5 md:pt-8 lg:px-8 lg:pb-6 lg:pt-10">
          <p className="text-outline-black mb-3 text-center text-4xl font-bold leading-tight tracking-tight text-white sm:mb-4 sm:text-5xl md:text-6xl lg:mb-5 lg:text-7xl">
            SLxAI Summit 2027
          </p>
          <p className="text-outline-black mb-3 text-center text-xl font-semibold tracking-[0.06em] text-cyan-100 sm:mb-4 sm:text-2xl md:text-3xl">
            {SUMMIT_2027_DATES}
          </p>
          <div className="mb-4 flex justify-center sm:mb-5 lg:mb-6">
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/40 bg-white/90 px-6 py-3.5 shadow-md shadow-black/20 backdrop-blur-sm sm:gap-x-3 sm:px-8 sm:py-5">
              <span className="h-3 w-3 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-orange-400" aria-hidden />
              <span className="text-lg font-semibold uppercase tracking-[0.12em] text-teal-800 sm:text-xl sm:tracking-[0.14em]">
                Hosted in
              </span>
              <span className="font-broadway text-5xl font-bold leading-none tracking-tight text-teal-800 sm:text-6xl">
                Miami, FL
              </span>
            </span>
          </div>
          <h1
            id="sponsor-hero-heading"
            className="text-balance text-center text-3xl font-normal tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55),0_1px_3px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.12]"
          >
            Sponsor the Future of Sign Language and AI
          </h1>
          <p className="text-outline-black mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-white sm:text-lg">
            Support the leading summit bringing together sign language researchers, AI companies, accessibility leaders,
            universities, and Deaf community voices to shape the future of ethical and effective sign language
            technology.
          </p>
          <p className="text-outline-black mx-auto mt-5 max-w-3xl text-center text-[1.53rem] font-semibold leading-relaxed text-white sm:text-[1.75rem]">
            Up to{' '}
            <span className="text-cyan-200">1,000 attendees</span> from{' '}
            <span className="text-cyan-200">25+ countries</span>
          </p>
          <div className="mt-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg border border-slate-200/90 bg-white px-8 text-base font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href="#sponsor-contact">Become a Sponsor</a>
            </Button>
          </div>
          <p className="text-outline-black mt-8 text-center text-sm text-white">
            For sponsorship inquiries, contact{' '}
            <a
              className="text-outline-black font-semibold text-sky-200 underline underline-offset-2 decoration-sky-200/80 hover:text-white hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>

      {/* Venue and Location */}
      <section
        className="relative border-b border-teal-100/60 bg-gradient-to-b from-cyan-50/50 via-white to-amber-50/35 pb-8 pt-4 sm:pb-10 sm:pt-6"
        aria-labelledby="venue-location-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-100/25 to-transparent sm:h-14"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="venue-location-heading" className={MIDPAGE_SECTION_TITLE_CLASS}>
            <span className="bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 bg-clip-text text-transparent">
              Venue and Location
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-4xl text-center text-sm leading-relaxed text-slate-600 sm:max-w-5xl sm:text-base">
            The summit runs{' '}
            <span className="text-base font-semibold text-slate-800 sm:text-lg">{SUMMIT_2027_DATES}</span> at the{' '}
            <span className="font-semibold text-slate-800">InterContinental Miami</span>, a high-visibility environment
            <br />
            for sponsors engaging with leaders in sign language AI, accessibility technology, and research.
          </p>

          <figure className="mt-8 overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
            <img
              src="/summit2027-venue-miami-skyline-intercontinental.png"
              alt="Miami bayfront skyline: InterContinental Miami and waterfront with yacht on turquoise water under a clear sky"
              className="block h-auto w-full object-cover object-center"
              loading="lazy"
              width={2000}
              height={900}
              decoding="async"
            />
          </figure>

          <figure className="mt-10 overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
              <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1]">
                <img
                  src="/summit2027-venue-grand-ballroom.png"
                  alt="Grand ballroom at InterContinental Miami: theater-style seating, stage, and ballroom lighting"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                  width={1600}
                  height={800}
                />
              </div>
              <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Grand Ballroom: </span>
                1000 seatings for keynote and plenary sessions
              </figcaption>
            </figure>

          <div className="mt-12 w-full">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <figure className="overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
                <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1]">
                  <img
                    src="/summit2027-venue-exhibit-hall.png"
                    alt="Exhibit hall at InterContinental Miami: banquet rounds, stage with venue branding, and open floor plan for exhibits and networking"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                    width={1600}
                    height={800}
                  />
                </div>
                <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Exhibit halls: </span>
                  We have two exhibit halls in Biscayne Ballroom and Chopin Ballroom.
                </figcaption>
              </figure>

              <figure className="overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
                <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1]">
                  <img
                    src="/summit2027-venue-atrium-2nd-floor.png"
                    alt="InterContinental Miami atrium on the second floor: lounge seating, central sculpture, and bar area under the skylight"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                    width={1600}
                    height={800}
                  />
                </div>
                <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Atrium: </span>
                  Center of the second floor, connecting sessions, exhibits, and sponsor touchpoints
                </figcaption>
              </figure>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
              <figure className="overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
                <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1]">
                  <img
                    src="/summit2027-venue-reception-lawn.png"
                    alt="Evening reception on the hotel lawn at InterContinental Miami: round dining tables, lighting, and downtown buildings at dusk"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                    width={1600}
                    height={800}
                  />
                </div>
                <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Evening receptions and outdoor events: </span>
                  InterContinental Miami offers dramatic outdoor lawn and terrace settings for receptions and
                  sponsor-hosted evening programming, with high visibility in a premium resort-style environment.
                </figcaption>
              </figure>

              <figure className="overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
                <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1]">
                  <img
                    src="/summit2027-venue-rooftop-pool.png"
                    alt="Rooftop pool at InterContinental Miami at dusk, with Blue Water Cafe and downtown views"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                    width={1600}
                    height={800}
                  />
                </div>
                <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Rooftop pool and hotel amenities: </span>
                  The property includes a rooftop pool deck and the Blue Water Cafe, premium spaces for informal sponsor
                  conversations and attendee downtime between summit sessions.
                </figcaption>
              </figure>
            </div>
          </div>

          <figure className="mt-12 w-full overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/50 to-amber-50/40 shadow-xl ring-1 ring-teal-900/5">
              <div className="w-full bg-gradient-to-b from-cyan-50/60 to-amber-50/40">
                <img
                  src="/summit2027-venue-level-2-floor-plan.png"
                  alt="InterContinental Miami second level mezzanine floor plan showing Grand Ballroom, Chopin and Biscayne ballrooms, central atrium, Chopin foyer, meeting rooms, and circulation"
                  className="block h-auto w-full object-contain object-center"
                  loading="lazy"
                  width={1200}
                  height={900}
                />
              </div>
              <figcaption className="border-t border-slate-100 bg-white px-4 py-4 text-center text-sm leading-relaxed text-slate-600 sm:px-6 sm:text-base">
                The summit occupies the{' '}
                <span className="font-semibold text-slate-800">entire second floor</span> of the InterContinental Miami.
                The atrium at the center of that level anchors the experience: an open, high-end circulation space between
                the ballroom, exhibit areas, and networking, so attendees and sponsors move through one cohesive
                environment.
              </figcaption>
            </figure>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="flex h-full min-h-0 flex-col rounded-2xl border border-teal-200/70 bg-gradient-to-br from-white/95 via-cyan-50/30 to-amber-50/20 p-5 shadow-md ring-1 ring-teal-900/10 sm:p-6">
              <h3 className={MIDPAGE_SECTION_TITLE_CLASS}>
                Event Venue
              </h3>
              <address className="mt-4 not-italic text-slate-800">
                <div className="mb-3 w-full rounded-lg border border-teal-100/80 bg-white/95 p-3 shadow-sm ring-1 ring-cyan-900/5 sm:p-4">
                  <img
                    src="/intercontinental-miami-logo.png"
                    alt="InterContinental Miami"
                    className="h-auto w-full max-h-28 object-contain object-center sm:max-h-32"
                    width={320}
                    height={64}
                  />
                </div>
                <span className="mt-1 block text-sm leading-snug text-slate-600">100 Chopin Plaza</span>
                <span className="block text-sm leading-snug text-slate-600">Miami, Florida 33131</span>
              </address>
              <div className="mt-4 overflow-hidden rounded-xl border border-teal-200/60 bg-slate-100 shadow-sm ring-1 ring-teal-900/5">
                <iframe
                  title="InterContinental Miami, 100 Chopin Plaza, Miami, Florida"
                  className="aspect-[16/10] w-full border-0 sm:aspect-[21/9]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=25.7723732,-80.1854646&hl=en&z=12&output=embed"
                />
                <p className="border-t border-teal-100/80 bg-white px-3 py-2 text-center text-xs text-slate-600">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=100+Chopin+Plaza%2C+Miami%2C+FL+33131"
                    className="font-medium text-teal-800 underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </p>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                The SLxAI Summit will be hosted at the InterContinental Miami, a four-diamond waterfront property
                located on Biscayne Bay in the heart of downtown Miami. Programming uses the full second floor (the
                ballroom, exhibit hall, and central atrium), so presentations, exhibits, and sponsor activations sit in
                one contiguous footprint. The central location provides strong accessibility for international attendees
                and high visibility for sponsor engagement.
              </p>
            </div>

            <div className="flex h-full min-h-0 flex-col gap-6">
              <div className="flex flex-col rounded-2xl border border-teal-200/70 bg-gradient-to-br from-white/95 via-cyan-50/30 to-amber-50/20 p-5 shadow-md ring-1 ring-teal-900/10 sm:p-6">
                <h3 className={MIDPAGE_SECTION_TITLE_CLASS}>Venue Highlights</h3>
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 sm:gap-2">
                  {[
                    {
                      icon: Presentation,
                      text: 'Grand Ballroom capable of hosting approximately 1000 attendees theater style',
                    },
                    {
                      icon: Building2,
                      text: 'Dedicated exhibit and sponsor networking areas',
                    },
                    { icon: Landmark, text: 'Waterfront downtown Miami location' },
                    { icon: UtensilsCrossed, text: 'Walking distance to restaurants and entertainment' },
                    { icon: Plane, text: 'Close to Miami International Airport' },
                    { icon: Sparkles, text: 'Premium conference environment for executive level audience' },
                  ].map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-start gap-2 rounded-lg border border-teal-100/90 bg-white/95 px-2.5 py-2 shadow-sm"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <p className="text-xs font-medium leading-snug text-slate-800 sm:text-[0.8125rem]">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col rounded-2xl border border-teal-200/70 bg-gradient-to-br from-white/95 via-cyan-50/30 to-amber-50/20 p-5 shadow-md ring-1 ring-teal-900/10 sm:p-6">
                <h3 className={MIDPAGE_SECTION_TITLE_CLASS}>Location Highlights</h3>
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 sm:gap-2">
                  {[
                    { icon: Building2, text: 'Downtown Miami business district' },
                    { icon: Globe2, text: 'International travel friendly destination' },
                    { icon: Eye, text: 'High sponsor visibility environment' },
                    { icon: Users, text: 'Ideal for networking and evening events' },
                    { icon: MapPin, text: 'Welcoming attendees from around the world' },
                    { icon: Sparkles, text: 'Strong tech and innovation ecosystem' },
                  ].map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-start gap-2 rounded-lg border border-amber-100/90 bg-white/95 px-2.5 py-2 shadow-sm"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-100 to-orange-100 text-orange-900">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <p className="text-xs font-medium leading-snug text-slate-800 sm:text-[0.8125rem]">{text}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Sponsors benefit from exposure across keynote sessions, networking areas, exhibit spaces, and evening
                  reception environments within a single cohesive venue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why sponsor */}
      <section
        className="border-b border-teal-200/40 bg-gradient-to-b from-cyan-50/45 via-orange-50/25 to-teal-50/35 pb-8 pt-8 sm:pb-10 sm:pt-10"
        aria-labelledby="why-sponsor-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-200/70 bg-gradient-to-br from-white/95 via-cyan-50/30 to-amber-50/25 p-5 shadow-md ring-1 ring-teal-900/10 backdrop-blur-sm sm:p-6">
            <div className="text-center">
              <h2 id="why-sponsor-heading" className={MIDPAGE_SECTION_TITLE_CLASS}>
                Why sponsor SLxAI?
              </h2>
            </div>
            <p className="mt-3 text-center text-sm leading-relaxed text-teal-900/80 sm:text-base">
              A focused audience, credible programming, and alignment with inclusive innovation.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              {WHY_SPONSOR_POINTS.map((item, i) => {
                const shell = MIAMI_HEADLINE_CARD_STYLES[i % MIAMI_HEADLINE_CARD_STYLES.length];
                return (
                  <li key={item.title}>
                    <div
                      className={`flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md ${shell.shell}`}
                    >
                      <div className="flex justify-center px-2 pt-2.5 sm:px-3 sm:pt-3">
                        <span
                          className={`${SPONSORSHIP_SECTION_TITLE_PILL_CLASS} ${item.titleSingleLine ? 'whitespace-nowrap' : ''}`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <p className="flex-1 px-3 pb-2.5 pt-2 text-xs leading-relaxed text-slate-600 sm:px-3 sm:pb-3 sm:text-sm">
                        {item.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section
        className="border-t border-teal-200/40 bg-gradient-to-b from-teal-50/35 via-cyan-50/30 to-orange-50/20 pb-4 pt-8 sm:pb-5 sm:pt-10"
        aria-labelledby="audience-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-yellow-50/95 via-amber-50/60 to-yellow-50/90 p-5 shadow-md ring-1 ring-amber-900/10 backdrop-blur-sm sm:p-6">
            <div className="text-center">
              <h2 id="audience-heading" className={MIDPAGE_SECTION_TITLE_CLASS}>
                Who You Will Reach
              </h2>
            </div>
            <p className="mt-3 text-center text-sm leading-relaxed text-amber-950/85 sm:text-base">
              High-intent builders, researchers, and implementers - not general conference traffic.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              {AUDIENCE_CATEGORIES.map((label) => (
                <li key={label} className="flex justify-center">
                  <span className={AUDIENCE_CATEGORY_PILL_CLASS}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="mt-8 w-full overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
            <div className="w-full bg-slate-900/[0.03]">
              <img
                src="/summit2027-venue-bayfront-hotel.png"
                alt="InterContinental Miami bayfront hotel view: waterfront setting, skyline, and rooftop-level atmosphere"
                className="block h-auto w-full"
                loading="lazy"
                width={2000}
                height={900}
                decoding="async"
              />
            </div>
            <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Hotel setting: </span>
              A premium bayfront environment for receptions and sponsor hospitality
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Tiers */}
      <section
        className="border-y border-teal-100/50 bg-gradient-to-b from-cyan-50/45 via-amber-50/25 to-white pb-8 pt-3 sm:pb-10 sm:pt-4"
        aria-labelledby="tiers-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              id="tiers-heading"
              className="font-broadway text-[3.75rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[4.5rem]"
            >
              Sponsorship tiers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Compare packages and choose the level of visibility that fits your organization.
            </p>
          </div>

          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {TIER_IDS_ORDER.map((tierId) => {
              const tier = SPONSORSHIP_TIERS.find((t) => t.id === tierId);
              if (!tier) return null;
              const banner = TIER_TOP_BANNERS[tierId];
              const stats = TIER_AVAILABILITY_STATS[tierId];
              return (
                <div key={tierId} className="group flex flex-col gap-8">
                  <div
                    className={`overflow-hidden rounded-xl border shadow-sm transition duration-200 ${SPOT_BOX_BORDER[tierId]} ${SPOT_BOX_GROUP_HOVER[tierId]}`}
                  >
                    <p
                      className={`py-2.5 text-center text-xl font-semibold uppercase leading-tight tracking-wider text-white shadow-sm sm:py-3 sm:text-2xl ${banner.barClass}`}
                    >
                      {TIER_SPOT_HEADER_LABEL[tierId]}
                    </p>
                    <div className={`px-3 py-3 text-center sm:px-4 ${SPOT_BOX_BODY_BG[tierId]}`}>
                      <p
                        className={`font-mono text-[2.5rem] font-bold leading-none tabular-nums sm:text-[3rem] ${SPOT_BOX_FRACTION_CLASS[tierId]}`}
                      >
                        {stats.fraction}
                      </p>
                      <p className={`mt-1 text-xs leading-snug ${SPOT_BOX_CAPTION_CLASS[tierId]}`}>
                        {stats.caption}
                      </p>
                    </div>
                  </div>

                  <article
                    className={`flex flex-col rounded-2xl border shadow-sm transition ${
                      tier.id === 'title'
                        ? 'border-orange-200/90 bg-gradient-to-br from-orange-50 to-amber-50/60 ring-2 ring-orange-200/50 ring-offset-2 ring-offset-white group-hover:shadow-md'
                        : tier.id === 'platinum'
                          ? 'border-blue-200/90 bg-gradient-to-br from-blue-50 to-sky-50/50 group-hover:border-blue-300/70 group-hover:shadow-md'
                          : tier.id === 'gold'
                            ? 'border-yellow-200/85 bg-gradient-to-br from-yellow-50 to-amber-50/40 group-hover:border-yellow-300/70 group-hover:shadow-md'
                            : tier.id === 'silver'
                              ? 'border-slate-300/75 bg-gradient-to-br from-slate-100 to-slate-50/90 group-hover:border-slate-400/70 group-hover:shadow-md'
                              : 'border-teal-100/90 bg-white/95 group-hover:border-cyan-200/60 group-hover:shadow-lg'
                    }`}
                  >
                    <p
                      className={`rounded-t-2xl py-2 text-center text-xs font-semibold uppercase tracking-wider text-white shadow-sm ${TIER_TOP_BANNERS[tier.id].barClass}`}
                    >
                      {TIER_TOP_BANNERS[tier.id].label}
                    </p>
                    <div className="flex flex-1 flex-col items-center p-6">
                      <h3 className="text-center text-xl font-bold text-slate-900">{tier.name}</h3>
                      <p className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">{tier.price}</p>
                      <ul className="mt-5 flex w-full flex-1 flex-col gap-3 text-left text-sm text-slate-600">
                        {tier.benefits.map((b) => (
                          <li key={b} className="flex gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className="mt-8 w-full rounded-lg border border-teal-200/90 bg-white text-sm font-semibold text-slate-900 shadow-sm transition-colors duration-200 group-hover:border-teal-300/80 group-hover:bg-teal-50/80 group-hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                      >
                        <a href={mailto(`Inquiry: ${tier.name}`)}>Discuss this tier</a>
                      </Button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons: compact card grid */}
      <section
        className="relative overflow-hidden border-t border-teal-100/50 bg-gradient-to-b from-white via-cyan-50/25 to-amber-50/30 pb-6 pt-6 sm:pb-8 sm:pt-8"
        aria-labelledby="addons-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 id="addons-heading" className={MIDPAGE_SECTION_TITLE_CLASS}>
            Additional Sponsorship Opportunities
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            Layer targeted visibility across receptions, meals, materials, and on-site amenities. Custom packages are
            available on request.
          </p>
          <div className="group mt-8">
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
            {ADD_ON_OPPORTUNITIES.map((row, i) => {
              const Icon = ADD_ON_ICONS[i] ?? Sparkles;
              const grad = ADD_ON_TOP_GRADIENTS[i] ?? 'from-slate-700 to-slate-900';
              return (
                <li key={row.name}>
                  <Card className="group/card h-full overflow-hidden border-slate-200/90 bg-white shadow-sm transition hover:border-electric-blue/40 hover:shadow-md">
                    <div className={`h-1 bg-gradient-to-r ${grad}`} aria-hidden />
                    <CardHeader className="space-y-0 px-4 pb-3 pt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-inner ring-1 ring-white/10 transition group-hover/card:bg-electric-blue">
                          <Icon className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base font-semibold leading-snug text-slate-900">{row.name}</CardTitle>
                          <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">{row.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              className="h-11 w-full max-w-md rounded-lg border border-teal-200/90 bg-white px-8 font-semibold text-slate-900 shadow-sm transition-colors duration-200 group-hover:border-teal-300/80 group-hover:bg-teal-50/80 group-hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
            >
              <a href={mailto('Additional sponsorship opportunities')}>Discuss add-on opportunities</a>
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Exhibit */}
      <section
        className="border-t border-teal-100/50 bg-gradient-to-b from-amber-50/35 via-white to-cyan-50/40 pb-16 pt-8 sm:pb-20 sm:pt-10"
        aria-labelledby="exhibit-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="exhibit-heading" className={MIDPAGE_SECTION_TITLE_CLASS}>
            Exhibit Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            Exhibit space puts your team in direct conversation with summit attendees in a focused environment, ideal for
            demos, discovery calls, and relationship building alongside plenary content. Exhibit halls are located in
            both the Biscayne Ballroom and Chopin Ballroom.
          </p>
          <div className="group mx-auto mt-12 w-full max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {EXHIBIT_LEVELS.map((ex, i) => {
                const shell = MIAMI_HEADLINE_CARD_STYLES[i] ?? MIAMI_HEADLINE_CARD_STYLES[0];
                return (
                  <article
                    key={ex.name}
                    className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-lg ${shell.shell}`}
                  >
                    <h3
                      className={`rounded-t-2xl px-3 py-3 text-center text-lg font-bold leading-snug text-white shadow-sm sm:text-xl ${shell.barClass}`}
                    >
                      {ex.name}
                    </h3>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-center text-3xl font-bold tracking-tight text-slate-900">{ex.price}</p>
                      <ul className="mt-5 flex w-full flex-1 flex-col gap-3 text-left text-sm text-slate-600">
                        {ex.benefits.map((b) => (
                          <li key={b} className="flex gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                className="h-11 w-full max-w-md rounded-lg border border-teal-200/90 bg-white px-8 font-semibold text-slate-900 shadow-sm transition-colors duration-200 group-hover:border-teal-300/80 group-hover:bg-teal-50/80 group-hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
              >
                <a href={mailto('Exhibit opportunity inquiry')}>Discuss Exhibit</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA: South Beach dusk photo + readable overlay */}
      <section
        id="sponsor-contact"
        className="relative min-h-[22rem] overflow-hidden border-t border-cyan-900/40 py-16 text-white sm:min-h-[26rem] sm:py-24"
        aria-labelledby="final-cta-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: "url('/summit2027-south-beach-footer.png')" }}
          aria-hidden
        />
        {/* Readability: strong scrim so body copy stays high-contrast on the photo */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.96] via-slate-950/92 to-slate-950/88"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(6, 182, 212, 0.1), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 20%, rgba(251, 113, 133, 0.06), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="final-cta-heading"
            className="text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.85)] sm:text-4xl"
          >
            Interested in Sponsoring SLxAI?
          </h2>
          <p className="mt-4 text-lg font-medium leading-relaxed text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.75)]">
            Join us{' '}
            <span className="text-xl font-semibold text-white sm:text-2xl">{SUMMIT_2027_DATES}</span> in Miami. We would
            be glad to discuss sponsorship options, exhibit opportunities,
            and custom partnership packages.
          </p>
          <div className="mt-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg border border-slate-200/90 bg-white px-8 font-semibold text-slate-900 shadow-lg shadow-black/15 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-slate-800" aria-hidden />
                Contact Us
              </a>
            </Button>
          </div>
          <p className="mt-8 text-sm font-medium text-zinc-100 [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-cyan-100 underline decoration-cyan-200/90 decoration-2 underline-offset-[5px] transition hover:text-white hover:decoration-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}


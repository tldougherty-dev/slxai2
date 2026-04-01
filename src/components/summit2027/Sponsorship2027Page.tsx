import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ADD_ON_OPPORTUNITIES,
  AUDIENCE_CATEGORIES,
  CONTACT_EMAIL,
  DIFFERENTIATORS,
  EXHIBIT_LEVELS,
  SPONSORSHIP_TIERS,
  WHY_SPONSOR_POINTS,
  type TierId,
} from '@/components/summit2027/summit2027SponsorshipData';
import {
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Eye,
  Handshake,
  IdCard,
  Landmark,
  Link2,
  Mail,
  MapPin,
  Megaphone,
  Plane,
  Presentation,
  Shield,
  Sparkles,
  Target,
  Users,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react';

const mailto = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

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

/** Miami palette: gradient bar + shell for exhibit cards and “Why SLxAI is different” cards */
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
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 md:pb-12 md:pt-8 lg:px-8 lg:pb-14 lg:pt-10">
          <p className="text-outline-black mb-4 text-center text-4xl font-bold leading-tight tracking-[0.08em] text-white sm:mb-5 sm:text-5xl sm:tracking-[0.1em] md:text-6xl md:tracking-[0.12em] lg:mb-6 lg:text-7xl lg:tracking-[0.14em]">
            SLxAI Summit 2027
          </p>
          <h1
            id="sponsor-hero-heading"
            className="text-balance text-center text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55),0_1px_3px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.12]"
          >
            Sponsor the Future of Sign Language and AI
          </h1>
          <p className="text-outline-black mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-white sm:text-lg">
            Building on our sold-out Boston debut
            <br />
            (20 amazing workshops · 220 attendees · 15 countries).
          </p>
          <p className="text-outline-black mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-white sm:text-lg">
            Support the leading summit bringing together sign language researchers, AI companies, accessibility leaders,
            universities, and Deaf community voices to shape the future of ethical and effective sign language
            technology.
          </p>
          <p className="text-outline-black mx-auto mt-5 max-w-3xl text-center text-[1.53rem] font-semibold leading-relaxed text-white sm:text-[1.75rem]">
            Up to{' '}
            <span className="text-cyan-200">1,000 attendees</span> from{' '}
            <span className="text-cyan-200">25+ countries</span>
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-electric-blue px-8 text-base font-semibold text-white shadow-lg shadow-electric-blue/25 transition hover:bg-electric-blue/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href="#sponsor-contact">Become a Sponsor</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-cyan-200/45 bg-white/10 text-white backdrop-blur hover:border-cyan-100/60 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={mailto('Sponsorship prospectus request')}>Download Sponsorship Prospectus</a>
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
        className="relative border-b border-teal-100/60 bg-gradient-to-b from-cyan-50/50 via-white to-amber-50/35 py-16 sm:py-20"
        aria-labelledby="venue-location-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-100/25 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-teal-200/60 bg-white/80 px-6 py-3 text-4xl font-semibold uppercase tracking-[0.12em] text-teal-800 shadow-sm backdrop-blur-sm sm:px-8 sm:py-4 sm:tracking-[0.14em]">
              <span className="h-3 w-3 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-orange-400" aria-hidden />
              Hosted in Miami
            </span>
          </div>
          <h2
            id="venue-location-heading"
            className="font-broadway mt-4 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            <span className="bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 bg-clip-text text-transparent">
              Venue and Location
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
            InterContinental Miami provides a high-visibility environment for sponsors engaging with leaders in sign
            language AI, accessibility technology, and research.
          </p>

          <div className="mx-auto mt-10 max-w-6xl">
            <figure className="overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
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
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
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

            <h3 className="mt-8 w-full text-center text-lg font-semibold text-slate-900 sm:text-xl">
              Second floor: dedicated to SLxAI
            </h3>
            <p className="mt-3 w-full max-w-none text-center text-sm leading-relaxed text-slate-600 sm:text-base">
              The summit occupies the{' '}
              <strong className="font-semibold text-slate-800">entire second floor</strong> of the InterContinental
              Miami. The atrium at the center of that level anchors the experience: an open, high-end circulation space
              between the ballroom, exhibit areas, and networking, so attendees and sponsors move through one cohesive
              environment.
            </p>

            <figure className="mt-8 w-full overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/50 to-amber-50/40 shadow-xl ring-1 ring-teal-900/5">
              <div className="flex justify-center bg-gradient-to-b from-cyan-50/60 to-amber-50/40 p-3 sm:p-5">
                <img
                  src="/summit2027-venue-level-2-floor-plan.png"
                  alt="InterContinental Miami second level mezzanine floor plan showing Grand Ballroom, Chopin and Biscayne ballrooms, central atrium, Chopin foyer, meeting rooms, and circulation"
                  className="h-auto w-full max-w-5xl object-contain"
                  loading="lazy"
                  width={1200}
                  height={900}
                />
              </div>
              <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-center text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Second floor map: </span>
                Level 2 (mezzanine): ballrooms, atrium, foyers, and meeting spaces; layout subject to final event
                production
              </figcaption>
            </figure>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
            <div className="space-y-4">
              <div>
                <h3 className="font-broadway text-center text-[1.6875rem] font-semibold text-slate-900">
                  Event Venue
                </h3>
                <address className="mt-3 not-italic text-slate-800">
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
              </div>
              <div className="overflow-hidden rounded-xl border border-teal-200/60 bg-slate-100 shadow-sm ring-1 ring-teal-900/5">
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
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                The SLxAI Summit will be hosted at the InterContinental Miami, a four-diamond waterfront property
                located on Biscayne Bay in the heart of downtown Miami. Programming uses the full second floor (the
                ballroom, exhibit hall, and central atrium), so presentations, exhibits, and sponsor activations sit in
                one contiguous footprint. The central location provides strong accessibility for international attendees
                and high visibility for sponsor engagement.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-broadway mb-3 text-center text-[1.6875rem] font-semibold text-slate-900">
                  Venue Highlights
                </h3>
                <ul className="grid gap-1.5 sm:grid-cols-2 sm:gap-2">
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

              <div>
                <h3 className="font-broadway mb-3 text-center text-[1.6875rem] font-semibold text-slate-900">
                  Location Highlights
                </h3>
                <ul className="grid gap-1.5 sm:grid-cols-2 sm:gap-2">
                  {[
                    { icon: Building2, text: 'Downtown Miami business district' },
                    { icon: Globe2, text: 'International travel friendly destination' },
                    { icon: Eye, text: 'High sponsor visibility environment' },
                    { icon: Users, text: 'Ideal for networking and evening events' },
                    { icon: MapPin, text: 'Accessible to Latin America, North America, and Europe' },
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
              </div>

              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Sponsors benefit from exposure across keynote sessions, networking areas, exhibit spaces, and evening
                reception environments within a single cohesive venue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why sponsor */}
      <section
        className="border-b border-teal-100/50 bg-gradient-to-b from-amber-50/40 via-cyan-50/30 to-white py-16 sm:py-20"
        aria-labelledby="why-sponsor-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-100/90 bg-white/95 p-5 shadow-sm ring-1 ring-teal-900/5 sm:p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 id="why-sponsor-heading" className="font-broadway text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Why sponsor SLxAI?
              </h2>
              <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
                High-impact visibility
              </span>
            </div>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 sm:text-base">
              A focused audience, credible programming, and alignment with inclusive innovation.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {WHY_SPONSOR_POINTS.map((item, i) => {
              const WhyIcon = [Target, Users, Shield, Megaphone, Handshake, Eye][i] ?? Megaphone;
              return (
              <li key={item.title}>
                <div className="h-full rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
                      <WhyIcon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-snug text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">{item.body}</p>
                    </div>
                  </div>
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
        className="border-t border-teal-100/40 bg-gradient-to-b from-white via-cyan-50/20 to-white py-16 sm:py-20"
        aria-labelledby="audience-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-100/90 bg-white/95 p-5 shadow-sm ring-1 ring-teal-900/5 sm:p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 id="audience-heading" className="font-broadway text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Who You Will Reach
              </h2>
              <span className="inline-flex items-center rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-900">
                Curated audience
              </span>
            </div>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 sm:text-base">
              High-intent builders, researchers, and implementers - not general conference traffic.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {AUDIENCE_CATEGORIES.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-800"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tiers */}
      {/* Hotel bayfront atmosphere (mid-page visual anchor) */}
      <figure className="mx-auto my-14 max-w-6xl overflow-hidden rounded-2xl border border-teal-200/50 bg-gradient-to-br from-cyan-50/40 to-amber-50/30 shadow-xl ring-1 ring-teal-900/5">
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

      <section
        className="border-y border-teal-100/50 bg-gradient-to-b from-cyan-50/45 via-amber-50/25 to-white py-16 sm:py-20"
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
            <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TIER_IDS_ORDER.map((tierId) => {
                const banner = TIER_TOP_BANNERS[tierId];
                const stats = TIER_AVAILABILITY_STATS[tierId];
                return (
                  <div
                    key={tierId}
                    className={`overflow-hidden rounded-xl border shadow-sm ${SPOT_BOX_BORDER[tierId]}`}
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
                );
              })}
            </div>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {SPONSORSHIP_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`flex flex-col rounded-2xl border shadow-sm transition hover:shadow-lg ${
                  tier.id === 'title'
                    ? 'border-orange-200/90 bg-gradient-to-br from-orange-50 to-amber-50/60 ring-2 ring-orange-200/50 ring-offset-2 ring-offset-white hover:shadow-md'
                    : tier.id === 'platinum'
                      ? 'border-blue-200/90 bg-gradient-to-br from-blue-50 to-sky-50/50 hover:border-blue-300/70 hover:shadow-md'
                      : tier.id === 'gold'
                        ? 'border-yellow-200/85 bg-gradient-to-br from-yellow-50 to-amber-50/40 hover:border-yellow-300/70 hover:shadow-md'
                        : tier.id === 'silver'
                          ? 'border-slate-300/75 bg-gradient-to-br from-slate-100 to-slate-50/90 hover:border-slate-400/70 hover:shadow-md'
                          : 'border-teal-100/90 bg-white/95 hover:border-cyan-200/60'
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
                    className="mt-8 w-full rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-sm hover:from-teal-700 hover:to-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                  >
                    <a href={mailto(`Inquiry: ${tier.name}`)}>Discuss this tier</a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons: compact card grid */}
      <section
        className="relative overflow-hidden border-t border-teal-100/50 bg-gradient-to-b from-white via-cyan-50/25 to-amber-50/30 py-12 sm:py-16"
        aria-labelledby="addons-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2
            id="addons-heading"
            className="font-broadway text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Additional Sponsorship Opportunities
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            Layer targeted visibility across receptions, meals, materials, and on-site amenities. Custom packages are
            available on request.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
            {ADD_ON_OPPORTUNITIES.map((row, i) => {
              const Icon = ADD_ON_ICONS[i] ?? Sparkles;
              const grad = ADD_ON_TOP_GRADIENTS[i] ?? 'from-slate-700 to-slate-900';
              return (
                <li key={row.name}>
                  <Card className="group h-full overflow-hidden border-slate-200/90 bg-white shadow-sm transition hover:border-electric-blue/40 hover:shadow-md">
                    <div className={`h-1 bg-gradient-to-r ${grad}`} aria-hidden />
                    <CardHeader className="space-y-0 px-4 pb-3 pt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-inner ring-1 ring-white/10 transition group-hover:bg-electric-blue">
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
              className="h-11 w-full max-w-md rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 px-8 text-white shadow-sm hover:from-teal-700 hover:to-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
            >
              <a href={mailto('Additional sponsorship opportunities')}>Discuss add-on opportunities</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Exhibit */}
      <section
        className="border-t border-teal-100/50 bg-gradient-to-b from-amber-50/35 via-white to-cyan-50/40 py-16 sm:py-20"
        aria-labelledby="exhibit-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="exhibit-heading" className="font-broadway text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Exhibit Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            Exhibit space puts your team in direct conversation with summit attendees in a focused environment, ideal for
            demos, discovery calls, and relationship building alongside plenary content. Exhibit halls are located in
            both the Biscayne Ballroom and Chopin Ballroom.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {EXHIBIT_LEVELS.map((ex, i) => {
              const shell = MIAMI_HEADLINE_CARD_STYLES[i] ?? MIAMI_HEADLINE_CARD_STYLES[0];
              return (
                <article
                  key={ex.name}
                  className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-lg ${shell.shell}`}
                >
                  <h3
                    className={`rounded-t-2xl px-3 py-2.5 text-center text-xs font-bold leading-snug text-white shadow-sm sm:text-sm ${shell.barClass}`}
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
        </div>
      </section>

      {/* Why different */}
      <section
        className="border-t border-teal-100/40 bg-gradient-to-b from-white to-cyan-50/25 py-16 sm:py-20"
        aria-labelledby="different-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="different-heading" className="font-broadway text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why SLxAI Is Different
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {DIFFERENTIATORS.map((d, i) => {
              const shell = MIAMI_HEADLINE_CARD_STYLES[i] ?? MIAMI_HEADLINE_CARD_STYLES[0];
              return (
                <article
                  key={d.title}
                  className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-lg ${shell.shell}`}
                >
                  <h3
                    className={`rounded-t-2xl px-3 py-2.5 text-center text-xs font-bold leading-snug text-white shadow-sm sm:text-sm ${shell.barClass}`}
                  >
                    {d.title}
                  </h3>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm leading-relaxed text-slate-600">{d.body}</p>
                  </div>
                </article>
              );
            })}
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
          <Building2
            className="mx-auto h-10 w-10 text-cyan-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            aria-hidden
          />
          <h2
            id="final-cta-heading"
            className="mt-6 text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.85)] sm:text-4xl"
          >
            Interested in Sponsoring SLxAI?
          </h2>
          <p className="mt-4 text-lg font-medium leading-relaxed text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.75)]">
            We would be glad to discuss sponsorship options, exhibit opportunities, and custom partnership packages.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-electric-blue px-8 font-semibold text-white shadow-lg shadow-electric-blue/20 hover:bg-electric-blue/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                Contact Us
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-2 border-white/90 bg-white/10 text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] backdrop-blur-sm hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={mailto('Request sponsorship deck')} className="inline-flex items-center justify-center gap-2">
                Request Sponsorship Deck
                <ArrowRight className="h-4 w-4" aria-hidden />
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


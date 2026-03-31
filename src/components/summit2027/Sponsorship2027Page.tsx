import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ADD_ON_OPPORTUNITIES,
  AUDIENCE_CATEGORIES,
  CONTACT_EMAIL,
  DIFFERENTIATORS,
  EXHIBIT_LEVELS,
  FAQ_ITEMS,
  SPONSORSHIP_TIERS,
  WHY_SPONSOR_POINTS,
} from '@/components/summit2027/summit2027SponsorshipData';
import {
  ArrowRight,
  BookOpen,
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

/** Matches order of ADD_ON_OPPORTUNITIES */
const ADD_ON_ICONS = [Sparkles, UtensilsCrossed, UtensilsCrossed, IdCard, Link2, Wifi, BookOpen] as const;

const ADD_ON_TOP_GRADIENTS = [
  'from-amber-500 via-orange-500 to-rose-600',
  'from-sky-500 to-blue-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-700',
  'from-slate-600 to-slate-900',
  'from-cyan-500 to-teal-600',
  'from-[#0080FF] to-blue-800',
] as const;

export function Sponsorship2027Page() {
  return (
    <main id="main-content" className="!bg-white bg-white text-slate-900">
      {/* Hero — Miami sunset skyline + overlays for legible white text */}
      <section
        className="relative min-h-[22rem] overflow-hidden border-b border-slate-200/80 text-white sm:min-h-[28rem] md:min-h-[32rem]"
        aria-labelledby="sponsor-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-[center_30%] bg-no-repeat sm:bg-center"
          style={{ backgroundImage: "url('/summit2027-hero-miami.png')" }}
          aria-hidden
        />
        {/* Base darkening for busy sunset + city lights */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-950/85 to-slate-950/95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/35"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 55% at 50% 15%, rgba(0,128,255,0.28), transparent), radial-gradient(ellipse 60% 45% at 90% 30%, rgba(251,146,60,0.08), transparent)',
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <p className="text-outline-black mb-4 text-center text-4xl font-bold uppercase leading-tight tracking-[0.08em] text-white sm:mb-5 sm:text-5xl sm:tracking-[0.1em] md:text-6xl md:tracking-[0.12em] lg:mb-6 lg:text-7xl lg:tracking-[0.14em]">
            SLxAI Summit 2027
          </p>
          <h1
            id="sponsor-hero-heading"
            className="text-balance text-center text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55),0_1px_3px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.12]"
          >
            Sponsor the Future of Sign Language and AI
          </h1>
          <p className="text-outline-black mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-white sm:text-lg">
            Support the leading summit bringing together sign language researchers, AI companies, accessibility
            leaders, universities, and Deaf community voices to shape the future of ethical and effective sign
            language technology.
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
              className="h-12 rounded-lg border-slate-500 bg-white/5 text-white backdrop-blur hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
        className="border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/40 to-white py-16 sm:py-20"
        aria-labelledby="venue-location-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
            Hosted in Miami
          </p>
          <h2
            id="venue-location-heading"
            className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Venue and Location
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
            InterContinental Miami provides a high-visibility environment for sponsors engaging with leaders in sign
            language AI, accessibility technology, and research.
          </p>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
            <figure className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-xl ring-1 ring-slate-900/5">
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
                <span className="font-semibold text-slate-800">Grand Ballroom</span>
                <span className="text-slate-500"> — </span>
                Theater-style seating for keynote and plenary sessions
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-xl ring-1 ring-slate-900/5">
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
                <span className="font-semibold text-slate-800">Exhibit hall</span>
                <span className="text-slate-500"> — </span>
                Dedicated space for exhibits, sponsor activations, and networking
              </figcaption>
            </figure>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <h3 className="text-center text-lg font-semibold text-slate-900 sm:text-xl">
              Second floor — dedicated to SLxAI
            </h3>
            <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
              The summit occupies the{' '}
              <strong className="font-semibold text-slate-800">entire second floor</strong> of the InterContinental
              Miami. The atrium at the center of that level anchors the experience—an open, high-end circulation space
              between the ballroom, exhibit areas, and networking, so attendees and sponsors move through one cohesive
              environment.
            </p>
            <figure className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-xl ring-1 ring-slate-900/5">
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
                <span className="font-semibold text-slate-800">Atrium</span>
                <span className="text-slate-500"> — </span>
                Center of the second floor, connecting sessions, exhibits, and sponsor touchpoints
              </figcaption>
            </figure>

            <figure className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-xl ring-1 ring-slate-900/5">
              <div className="flex justify-center bg-slate-50 p-3 sm:p-5">
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
                <span className="font-semibold text-slate-800">Second floor map</span>
                <span className="text-slate-500"> — </span>
                Level 2 (mezzanine): ballrooms, atrium, foyers, and meeting spaces — layout subject to final event
                production
              </figcaption>
            </figure>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Event Venue</h3>
                <address className="mt-4 not-italic text-slate-800">
                  <div className="mb-4 rounded-lg border border-slate-100 bg-white p-3 shadow-sm sm:inline-block sm:p-4">
                    <img
                      src="/intercontinental-miami-logo.png"
                      alt="InterContinental Miami"
                      className="h-14 w-auto max-w-[min(100%,320px)] object-contain object-left sm:h-16"
                      width={320}
                      height={64}
                    />
                  </div>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">100 Chopin Plaza</span>
                  <span className="block text-sm leading-relaxed text-slate-600">Miami, Florida</span>
                </address>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                The SLxAI Summit will be hosted at the InterContinental Miami, a four-diamond waterfront property
                located on Biscayne Bay in the heart of downtown Miami. Programming uses the full second floor—the
                ballroom, exhibit hall, and central atrium—so presentations, exhibits, and sponsor activations sit in
                one contiguous footprint. The central location provides strong accessibility for international attendees
                and high visibility for sponsor engagement.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Venue Highlights</h3>
              <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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
                  <li key={text}>
                    <Card className="h-full border-slate-200/90 bg-white shadow-sm transition hover:border-electric-blue/25 hover:shadow-md">
                      <CardContent className="flex gap-3 p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <p className="text-sm font-medium leading-snug text-slate-800">{text}</p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14">
            <h3 className="mb-4 text-center text-lg font-semibold text-slate-900 lg:text-left">Location Highlights</h3>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Building2, text: 'Downtown Miami business district' },
                { icon: Globe2, text: 'International travel friendly destination' },
                { icon: Eye, text: 'High sponsor visibility environment' },
                { icon: Users, text: 'Ideal for networking and evening events' },
                { icon: MapPin, text: 'Accessible to Latin America, North America, and Europe' },
                { icon: Sparkles, text: 'Strong tech and innovation ecosystem' },
              ].map(({ icon: Icon, text }) => (
                <li key={text}>
                  <Card className="h-full border-slate-200/90 bg-white shadow-sm transition hover:border-electric-blue/25 hover:shadow-md">
                    <CardContent className="flex gap-3 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <p className="text-sm font-medium leading-snug text-slate-800">{text}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            Sponsors benefit from exposure across keynote sessions, networking areas, exhibit spaces, and evening
            reception environments within a single cohesive venue.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Card className="border-slate-200/90 bg-white shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-xl text-slate-900">Expected attendance</CardTitle>
                <CardDescription className="text-base font-semibold text-slate-800">
                  Up to 1000 participants
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Audience includes</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {[
                    'AI companies',
                    'Sign language technology companies',
                    'Universities',
                    'Accessibility organizations',
                    'Interpreters and service providers',
                    'Deaf community leaders',
                    'Policy and public sector representatives',
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 bg-white shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-xl text-slate-900">Sponsor visibility opportunities</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Integrated touchpoints across the venue experience
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {[
                    'Ballroom stage branding',
                    'Exhibit hall presence',
                    'Registration area signage',
                    'Reception branding',
                    'Program and digital visibility',
                    'Website sponsor listing',
                    'Onsite announcements',
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why sponsor */}
      <section className="border-b border-slate-100 bg-slate-50/90 py-16 sm:py-20" aria-labelledby="why-sponsor-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="why-sponsor-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why sponsor SLxAI?
            </h2>
            <p className="mt-3 text-slate-600">
              A focused audience, credible programming, and alignment with inclusive innovation.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_SPONSOR_POINTS.map((item, i) => {
              const WhyIcon = [Target, Users, Shield, Megaphone, Handshake, Eye][i] ?? Megaphone;
              return (
              <li key={item.title}>
                <Card className="h-full border-slate-200/80 bg-white shadow-sm transition hover:border-electric-blue/30 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <WhyIcon className="h-5 w-5" aria-hidden />
                    </div>
                    <CardTitle className="text-lg leading-snug text-slate-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-slate-600">{item.body}</CardDescription>
                  </CardContent>
                </Card>
              </li>
            );
            })}
          </ul>
        </div>
      </section>

      {/* Audience */}
      <section className="py-16 sm:py-20" aria-labelledby="audience-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="audience-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Who You Will Reach
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            This is a curated audience of builders, researchers, implementers, and community leaders—not general
            conference traffic. Expect depth, relevance, and decision-oriented conversations.
          </p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCE_CATEGORIES.map((label) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-electric-blue/25 hover:shadow-md"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Users className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-medium leading-snug text-slate-800">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tiers */}
      <section
        className="border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20"
        aria-labelledby="tiers-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="tiers-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sponsorship tiers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Compare packages and choose the level of visibility and engagement that fits your organization.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {SPONSORSHIP_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`flex flex-col rounded-2xl border bg-white shadow-sm transition hover:shadow-lg ${
                  tier.featured
                    ? 'border-amber-400/60 ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {tier.featured ? (
                  <p className="rounded-t-2xl bg-gradient-to-r from-amber-500/90 to-amber-600/90 py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    Premier package
                  </p>
                ) : null}
                <div className="flex flex-1 flex-col p-6 pt-6">
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{tier.price}</p>
                  <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-8 w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2"
                  >
                    <a href={mailto(`Inquiry: ${tier.name}`)}>Discuss this tier</a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons — card grid */}
      <section
        className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-slate-50/95 via-white to-slate-50/80 py-16 sm:py-20"
        aria-labelledby="addons-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-blue/25 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="addons-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Additional Sponsorship Opportunities
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Layer targeted visibility across receptions, meals, materials, and on-site amenities. Custom packages are
            available on request.
          </p>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ADD_ON_OPPORTUNITIES.map((row, i) => {
              const Icon = ADD_ON_ICONS[i] ?? Sparkles;
              const grad = ADD_ON_TOP_GRADIENTS[i] ?? 'from-slate-700 to-slate-900';
              return (
                <li key={row.name}>
                  <Card className="group h-full overflow-hidden border-slate-200/90 bg-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-electric-blue/35 hover:shadow-xl">
                    <div
                      className={`h-1.5 bg-gradient-to-r ${grad}`}
                      aria-hidden
                    />
                    <CardHeader className="pb-2 pt-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-inner ring-1 ring-white/10 transition group-hover:bg-electric-blue">
                          <Icon className="h-6 w-6" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg leading-snug text-slate-900">{row.name}</CardTitle>
                          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{row.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-5 pt-0">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-200 text-slate-800 hover:border-electric-blue/50 hover:bg-electric-blue/5 hover:text-slate-900"
                      >
                        <a href={mailto(`Inquiry: ${row.name}`)}>Discuss this opportunity</a>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Exhibit */}
      <section className="border-t border-slate-100 bg-slate-50/80 py-16 sm:py-20" aria-labelledby="exhibit-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="exhibit-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Exhibit Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            Exhibit space puts your team in direct conversation with summit attendees in a focused environment—ideal for
            demos, discovery calls, and relationship building alongside plenary content.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {EXHIBIT_LEVELS.map((ex) => (
              <Card
                key={ex.name}
                className="border-slate-200 bg-white shadow-sm transition hover:border-electric-blue/30 hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{ex.name}</CardTitle>
                  <p className="text-2xl font-bold text-slate-900">{ex.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {ex.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why different */}
      <section className="py-16 sm:py-20" aria-labelledby="different-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="different-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why SLxAI Is Different
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {DIFFERENTIATORS.map((d, i) => {
              const icons = [Globe2, Landmark, Shield, Sparkles];
              const Icon = icons[i % icons.length];
              return (
                <div
                  key={d.title}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{d.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 bg-slate-50/90 py-16 sm:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-10 w-full rounded-xl border border-slate-200 bg-white px-4 shadow-sm sm:px-6">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={item.q}>
                <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="sponsor-contact"
        className="border-t border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 py-16 text-white sm:py-20"
        aria-labelledby="final-cta-heading"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Building2 className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <h2 id="final-cta-heading" className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Interested in Sponsoring SLxAI?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
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
              className="h-12 rounded-lg border-slate-500 bg-transparent text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <a href={mailto('Request sponsorship deck')} className="inline-flex items-center justify-center gap-2">
                Request Sponsorship Deck
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-electric-blue underline-offset-2 hover:text-sky-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

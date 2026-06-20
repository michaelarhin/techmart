import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  MapPin,
  ScanLine,
  Wallet,
  UserCheck,
  Users,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { fadeUp, stagger, item, viewportOnce } from '../lib/motion';

const tips = [
  {
    icon: MapPin,
    title: 'Meet in a busy, public place',
    desc: 'Daylight, somewhere with people around — a mall, bank lobby, or campus. Avoid quiet spots and never invite a stranger to your home.',
  },
  {
    icon: ScanLine,
    title: 'Inspect before you pay',
    desc: 'Power the device on, test the ports, camera and battery, and check serial or IMEI numbers. If it cannot be demonstrated working, treat that as a no.',
  },
  {
    icon: Wallet,
    title: 'Pay only when you are satisfied',
    desc: 'Hand over payment in person, after you have seen the item. Never send a deposit or transfer to someone you have not met.',
  },
  {
    icon: UserCheck,
    title: 'Check who you are dealing with',
    desc: 'Look at the profile, ratings and reviews, and keep your first conversations inside TechMart. A solid history is a good sign.',
  },
  {
    icon: Users,
    title: 'Bring a friend for big deals',
    desc: 'A second person is great backup for high-value items, and makes the whole meet-up safer and calmer for everyone.',
  },
  {
    icon: Sparkles,
    title: 'Trust your instincts',
    desc: 'If a price seems too good to be true, or someone is rushing you, pause. The best deals can wait for you to feel comfortable.',
  },
];

const redFlags = [
  'Asks for payment or a "deposit" before you have met or seen the item.',
  'Refuses to meet in public, or to show the device powered on and working.',
  'Pressures you to decide instantly or to move the chat off TechMart.',
  'Requests gift cards, crypto, or unusual payment methods.',
  'Gives vague answers and a story that keeps changing.',
];

const SafetyTips = () => (
  <div className="pt-24 md:pt-28 pb-10">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="surface rounded-4xl p-7 sm:p-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface-muted text-xs font-semibold text-accent w-fit">
          <ShieldCheck className="w-4 h-4" />
          Safety tips
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold text-ink leading-tight">
          Trade smart, stay safe
        </h1>
        <p className="mt-4 text-ink-muted text-base sm:text-lg max-w-2xl leading-relaxed">
          The vast majority of deals on TechMart go smoothly — and a few simple habits keep it that
          way. Take a minute to read these before you buy or sell. Your safety is always worth it.
        </p>
      </motion.div>

      {/* Tips */}
      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10"
      >
        {tips.map((t) => (
          <motion.div key={t.title} variants={item} className="surface rounded-3xl p-6">
            <span className="w-12 h-12 rounded-2xl surface-muted grid place-items-center text-navy-600 mb-4">
              <t.icon className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-ink">{t.title}</h3>
            <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Red flags */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="rounded-4xl p-7 sm:p-9 mt-10 bg-amber-500/10 border border-amber-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 grid place-items-center">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink">Watch for these red flags</h2>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {redFlags.map((flag) => (
            <li key={flag} className="flex items-start gap-2.5 text-ink-soft">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="leading-relaxed">{flag}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-ink-muted">
          If a deal feels wrong, it's okay to walk away — no explanation needed.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative overflow-hidden rounded-5xl bg-navy-600 text-white p-8 sm:p-12 mt-10"
      >
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Spotted something off?</h2>
          <p className="text-white/70 mt-2 text-lg">
            Tell us. Reporting a dodgy listing or member helps protect the whole community — and we
            act on every report.
          </p>
          <Link
            to="/help"
            className="group inline-flex items-center gap-1.5 pl-5 pr-2 py-2 rounded-full btn-lime transition-colors duration-300 mt-6"
          >
            <span className="text-sm">Contact support</span>
            <span className="w-8 h-8 rounded-full bg-navy-600 text-white grid place-items-center transition-transform duration-300 ease-spring group-hover:rotate-45">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
        <span aria-hidden className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <span aria-hidden className="absolute bottom-0 right-24 w-24 h-24 rounded-full bg-lime/10" />
      </motion.div>

      <div className="text-center mt-10">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-navy-600 transition-colors">
          Back to the marketplace
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);

export default SafetyTips;

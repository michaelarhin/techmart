import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  ShoppingBag,
  Tag,
  ShieldCheck,
  UserCog,
  ChevronDown,
  Phone,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { fadeUp, stagger, item, viewportOnce, EASE } from '../lib/motion';

const WHATSAPP_DISPLAY = '+233 54 050 3689';
const WHATSAPP_LINK = 'https://wa.me/233540503689';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const topics = [
  { icon: ShoppingBag, title: 'Buying', desc: 'Finding gear, contacting sellers and meeting up safely.' },
  { icon: Tag, title: 'Selling', desc: 'Posting a listing, pricing, photos and renewing.' },
  { icon: UserCog, title: 'Account', desc: 'Sign in, profile, and managing your listings.' },
  { icon: ShieldCheck, title: 'Trust & safety', desc: 'Avoiding scams and trading with confidence.' },
];

const faqs = [
  {
    q: 'What can I buy and sell on TechMart?',
    a: 'Anything tech: phones, laptops, desktop PCs and parts, cameras, audio gear, gaming consoles, wearables, TVs, drones and smart-home devices. If it has a chip in it, it probably belongs here.',
  },
  {
    q: 'How do I post a listing?',
    a: 'Sign in, hit "Sell", then follow the four short steps — details, category & price, photos, and your location/contact. Add clear photos and an honest description to sell faster.',
  },
  {
    q: 'How long does my listing stay live?',
    a: 'Every listing runs for 30 days. As the deadline gets close we email or text you so you can renew it with one tap. If you do nothing, it simply disappears from the marketplace — you can always renew or repost later.',
  },
  {
    q: 'Is it free to list an item?',
    a: 'Yes. Posting and browsing are free. You arrange the sale directly with the buyer or seller.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'Open any listing and use the "Reach the seller" buttons — call, WhatsApp, email, or message them right here on TechMart. Sellers choose which contact details to share.',
  },
  {
    q: 'How do I stay safe?',
    a: 'Meet in a busy public place, inspect the item before paying, and never send money in advance to someone you have not met. Trust your instincts — if a deal feels off, walk away.',
  },
  {
    q: 'How do payments work?',
    a: 'TechMart connects buyers and sellers; payment is arranged directly between you. We recommend paying in person once you have seen the item.',
  },
];

const FaqRow = ({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) => (
  <div className="surface rounded-2xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
      aria-expanded={open}
    >
      <span className="font-semibold text-ink">{q}</span>
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="shrink-0 text-ink-muted"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-5 text-ink-muted leading-relaxed">{a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="pt-24 md:pt-28 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="surface rounded-4xl p-7 sm:p-10 relative overflow-hidden">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface-muted text-xs font-semibold text-accent w-fit">
            <LifeBuoy className="w-4 h-4" />
            Help center
          </span>
          <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold text-ink leading-tight">
            How can we help?
          </h1>
          <p className="mt-4 text-ink-muted text-base sm:text-lg max-w-xl leading-relaxed">
            Answers to the common questions about buying, selling and staying safe on TechMart.
            Still stuck? We're a WhatsApp message away.
          </p>
          <div className="mt-6">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full btn-lime transition-colors duration-300"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span className="text-sm">Chat on WhatsApp</span>
              <span className="w-8 h-8 rounded-full bg-navy-600 text-white grid place-items-center transition-transform duration-300 ease-spring group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
          </div>
        </motion.div>

        {/* Topics */}
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10"
        >
          {topics.map((t) => (
            <motion.div key={t.title} variants={item} className="surface rounded-3xl p-5">
              <span className="w-11 h-11 rounded-2xl surface-muted grid place-items-center text-navy-600 mb-3">
                <t.icon className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-ink text-sm">{t.title}</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ */}
        <div className="mt-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="mb-5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-1">Frequently asked</h2>
          </motion.div>

          <motion.div
            variants={stagger(0.05)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col gap-3"
          >
            {faqs.map((f, i) => (
              <motion.div key={f.q} variants={item}>
                <FaqRow
                  q={f.q}
                  a={f.a}
                  open={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Contact CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-5xl bg-navy-600 text-white p-8 sm:p-12 mt-12"
        >
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Still need a hand?</h2>
            <p className="text-white/70 mt-2 text-lg max-w-lg">
              Message or call our support line — we reply fastest on WhatsApp.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-5 py-4 rounded-2xl btn-lime transition-colors"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span className="font-bold">{WHATSAPP_DISPLAY}</span>
              </a>
              <a
                href="tel:+233540503689"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call instead
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
              <Clock className="w-4 h-4" />
              <span>Support hours: Mon–Sat, 8am–8pm GMT</span>
            </div>
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
};

export default HelpCenter;

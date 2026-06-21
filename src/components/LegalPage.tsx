import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { fadeUp, stagger, item, viewportOnce } from '../lib/motion';

export interface LegalSection {
  id: string;
  heading: string;
  body: string[];
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const LegalPage = ({ eyebrow, title, updated, intro, sections }: LegalPageProps) => (
  <div className="pt-24 md:pt-28 pb-10">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="surface rounded-2xl p-7 sm:p-10">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</span>
        <h1 className="mt-2 text-3xl sm:text-5xl font-bold text-ink leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-faint">Last updated {updated}</p>
        <p className="mt-5 text-ink-muted text-base sm:text-lg leading-relaxed max-w-2xl">{intro}</p>
      </motion.div>

      <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-faint mb-3">Contents</p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm text-ink-muted hover:text-ink transition-colors py-1"
                >
                  {s.heading}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Body */}
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-col gap-4"
        >
          {sections.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              variants={item}
              className="surface rounded-xl p-6 sm:p-7 scroll-mt-28"
            >
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-baseline gap-3">
                <span className="text-accent text-sm font-bold">{String(i + 1).padStart(2, '0')}</span>
                {s.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {s.body.map((p, idx) => (
                  <p key={idx} className="text-ink-muted leading-relaxed">{p}</p>
                ))}
              </div>
            </motion.section>
          ))}

          <p className="text-xs text-ink-faint leading-relaxed px-1">
            This page is written in plain language to be genuinely useful. It's a summary of how we
            operate and isn't a substitute for formal legal advice. Questions? {' '}
            <Link to="/help" className="text-ink-muted hover:text-ink underline underline-offset-2">
              Reach our team
            </Link>.
          </p>
        </motion.div>
      </div>

      <div className="text-center mt-10">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-navy-600 transition-colors">
          Back to the marketplace
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);

export default LegalPage;

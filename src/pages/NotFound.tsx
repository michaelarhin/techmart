import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowUpRight } from 'lucide-react';
import { fadeUp } from '../lib/motion';

const NotFound = () => (
  <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="surface rounded-2xl p-10 sm:p-14 text-center max-w-lg">
      <span className="w-16 h-16 mx-auto rounded-2xl surface-muted grid place-items-center text-navy-600 mb-6">
        <Compass className="w-8 h-8" />
      </span>
      <p className="text-6xl font-bold text-ink tracking-tight">404</p>
      <h1 className="text-2xl font-bold text-ink mt-3">This page wandered off</h1>
      <p className="text-ink-muted mt-2 leading-relaxed">
        The link may be broken, or the listing might have expired and disappeared. Let's get you back on track.
      </p>
      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn-navy px-6 py-3 rounded-full transition-colors">Back home</Link>
        <Link to="/marketplace" className="group inline-flex items-center gap-1.5 px-6 py-3 rounded-full border border-line bg-surface text-ink font-semibold hover:shadow-pill transition-shadow">
          Browse marketplace
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;

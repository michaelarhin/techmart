import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Link2, Check } from 'lucide-react';
import { springSnappy, EASE } from '../lib/motion';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

interface ShareSheetProps {
  url: string;
  title: string;
  text?: string;
}

const ShareSheet = ({ url, title, text }: ShareSheetProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const message = text || `Check out "${title}" on TechMart`;
  const encodedUrl = encodeURIComponent(url);
  const encodedMsg = encodeURIComponent(message + ' ' + url);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channels = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodedMsg}`, color: '#25D366', icon: WhatsAppIcon },
    { name: 'X (Twitter)', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodedUrl}`, color: '#000', icon: XIcon },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: '#1877F2', icon: () => <span className="text-base font-bold">f</span> },
  ];

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        transition={springSnappy}
        className="w-14 grid place-items-center rounded-2xl border border-line bg-surface text-ink-muted hover:text-ink hover:shadow-pill transition-all"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full max-w-sm bg-surface rounded-xl p-6 shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-ink text-lg">Share this listing</h3>
                <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex justify-center gap-5 mb-5">
                {channels.map((ch) => (
                  <a
                    key={ch.name}
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <motion.span
                      whileHover={{ y: -4, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springSnappy}
                      className="w-12 h-12 rounded-full grid place-items-center text-white"
                      style={{ background: ch.color }}
                    >
                      <ch.icon className="w-5 h-5" />
                    </motion.span>
                    <span className="text-xs text-ink-muted">{ch.name}</span>
                  </a>
                ))}
              </div>

              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-line bg-surface hover:bg-canvas text-ink font-semibold text-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareSheet;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { springSnappy } from '../lib/motion';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

interface ContactItem {
  key: string;
  label: string;
  color: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
}

const ContactPill = ({ item }: { item: ContactItem }) => {
  const [ripple, setRipple] = useState(0);

  const trigger = () => {
    setRipple((n) => n + 1);
    item.onClick?.();
  };

  const inner = (
    <>
      <AnimatePresence>
        {ripple > 0 && (
          <motion.span
            key={ripple}
            className="absolute inset-0 rounded-full"
            style={{ background: item.color }}
            initial={{ opacity: 0.45, scale: 0.6 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
      <span className="relative grid place-items-center w-full h-full" style={{ color: item.color }}>
        {item.icon}
      </span>
    </>
  );

  const sharedProps = {
    className: 'relative grid place-items-center w-12 h-12 rounded-full',
    style: { background: `color-mix(in srgb, ${item.color} 14%, transparent)` },
    whileHover: { y: -5, scale: 1.12 },
    whileTap: { scale: 0.84 },
    transition: springSnappy,
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {item.href ? (
        <motion.a
          {...sharedProps}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          onClick={trigger}
          aria-label={item.label}
        >
          {inner}
        </motion.a>
      ) : (
        <motion.button {...sharedProps} type="button" onClick={trigger} aria-label={item.label}>
          {inner}
        </motion.button>
      )}
      <span className="text-xs font-medium text-ink-muted">{item.label}</span>
    </div>
  );
};

interface ContactBarProps {
  name: string;
  phone?: string | null;
  email?: string | null;
  onMessage?: () => void;
  showMessage?: boolean;
}

const toWhatsApp = (phone: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `233${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
};

const ContactBar: React.FC<ContactBarProps> = ({ name, phone, email, onMessage, showMessage }) => {
  const items: ContactItem[] = [];

  if (phone) {
    items.push({
      key: 'call',
      label: 'Call',
      color: '#16a34a',
      href: `tel:${phone}`,
      icon: <Phone className="w-5 h-5" />,
    });
    items.push({
      key: 'whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
      href: toWhatsApp(phone),
      external: true,
      icon: <WhatsAppIcon className="w-5 h-5" />,
    });
  }
  if (email) {
    items.push({
      key: 'email',
      label: 'Email',
      color: '#EA4335',
      href: `mailto:${email}`,
      icon: <Mail className="w-5 h-5" />,
    });
  }
  if (showMessage) {
    items.push({
      key: 'message',
      label: 'Message',
      color: '#2563eb',
      onClick: onMessage,
      icon: <MessageCircle className="w-5 h-5" />,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="surface rounded-xl p-6">
      <h3 className="font-bold text-ink mb-1">Reach {name.split(' ')[0] || 'the seller'}</h3>
      <p className="text-sm text-ink-muted mb-4">Tap an option to get in touch directly.</p>
      <div className="flex flex-wrap gap-5">
        {items.map((item) => (
          <ContactPill key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ContactBar;

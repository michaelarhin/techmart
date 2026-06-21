import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageCircle, Heart, UserPlus, Star, ShoppingBag } from 'lucide-react';
import { getNotifications, getUnreadCount, markNotificationsRead, supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { springSnappy, EASE } from '../lib/motion';

const typeIcons: Record<string, typeof Bell> = {
  message: MessageCircle,
  favorite: Heart,
  follow: UserPlus,
  review: Star,
  listing_sold: ShoppingBag,
};

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    if (!user) return;
    const c = await getUnreadCount(user.id);
    setCount(c);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`notif:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleOpen = async () => {
    if (!user) return;
    setOpen(true);
    const { data } = await getNotifications(user.id);
    setItems(data as Notification[]);
    await markNotificationsRead(user.id);
    setCount(0);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        transition={springSnappy}
        className="relative w-9 h-9 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] surface rounded-xl overflow-hidden z-50 origin-top-right"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-line">
                <h3 className="font-bold text-ink">Notifications</h3>
                <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                {items.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 text-ink-faint mx-auto mb-2" />
                    <p className="text-ink-muted text-sm">No notifications yet</p>
                  </div>
                ) : (
                  items.map((n) => {
                    const Icon = typeIcons[n.type] || Bell;
                    return (
                      <Link
                        key={n.id}
                        to={n.link || '#'}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-3 px-5 py-3 hover:bg-canvas/60 transition-colors ${!n.is_read ? 'bg-canvas/40' : ''}`}
                      >
                        <span className="w-9 h-9 rounded-full surface-muted grid place-items-center text-navy-600 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink">{n.title}</p>
                          {n.body && <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</p>}
                          <p className="text-xs text-ink-faint mt-1">
                            {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import { springSnappy } from '../lib/motion';
import {
  Search,
  Plus,
  Heart,
  MessageCircle,
  Menu,
  X,
  LogOut,
  LogIn,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

const Layout = () => {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace', icon: Search },
    { name: 'Sell', path: '/create', icon: Plus, auth: true },
    { name: 'Favorites', path: '/favorites', icon: Heart, auth: true },
    { name: 'Messages', path: '/messages', icon: MessageCircle, auth: true },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, auth: true, admin: true },
  ];

  const filteredLinks = navLinks.filter(
    (link) => (!link.auth || user) && (!('admin' in link) || profile?.is_admin)
  );

  return (
    <div className="relative min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
        <motion.nav
          initial={false}
          animate={{
            boxShadow: isScrolled
              ? '0 1px 2px rgba(17,20,24,0.05), 0 20px 50px -28px rgba(17,20,24,0.3)'
              : '0 1px 2px rgba(17,20,24,0.03), 0 10px 30px -24px rgba(17,20,24,0.18)',
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`max-w-7xl mx-auto border border-line bg-surface/85 backdrop-blur-xl ${
            isMobileMenuOpen ? 'rounded-3xl' : 'rounded-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3 h-14 md:h-16 pl-3 pr-2 md:pl-5 md:pr-3">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-navy-600 overflow-hidden">
                <img src="/images/logo.png" alt="TechMart" className="w-6 h-6 object-contain" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink">TechMart</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 relative">
              {filteredLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
                      active ? 'text-white' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-navy-600"
                        transition={springSnappy}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <CurrencySelector />
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-line bg-surface hover:shadow-pill transition-shadow duration-300"
                  >
                    <span className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white font-bold text-sm">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                    <span className="text-sm font-semibold text-ink max-w-[120px] truncate">
                      {profile?.full_name || 'Account'}
                    </span>
                  </Link>
                  <button
                    onClick={signOut}
                    aria-label="Sign out"
                    className="w-9 h-9 rounded-full grid place-items-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="btn-navy flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-colors duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-full grid place-items-center text-ink hover:bg-canvas transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="md:hidden overflow-hidden border-t border-line"
              >
                <div className="px-3 pb-4 pt-2 flex flex-col gap-1 bg-surface rounded-b-3xl">
                  {filteredLinks.map((link) => {
                    const active = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                          active ? 'bg-navy-600 text-white' : 'text-ink-soft hover:bg-canvas'
                        }`}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    );
                  })}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-ink-muted">Currency</span>
                    <CurrencySelector />
                  </div>
                  <div className="border-t border-line my-1 pt-2">
                    {user ? (
                      <button
                        onClick={signOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-ink-soft hover:bg-canvas transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign out
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        className="flex items-center justify-center gap-2 btn-navy px-4 py-3 rounded-2xl"
                      >
                        <LogIn className="w-5 h-5" />
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      <main className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="surface rounded-4xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <Link to="/" className="flex items-center gap-2.5 mb-4">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-navy-600 overflow-hidden">
                    <img src="/images/logo.png" alt="TechMart" className="w-6 h-6 object-contain" />
                  </span>
                  <span className="text-lg font-extrabold tracking-tight text-ink">TechMart</span>
                </Link>
                <p className="text-ink-muted text-sm leading-relaxed max-w-xs">
                  A calmer marketplace for tech. Buy, sell, and trade phones, laptops, PCs,
                  cameras, consoles and gadgets with sellers you can actually talk to.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-ink mb-4 text-sm">Marketplace</h4>
                <ul className="space-y-2.5 text-sm text-ink-muted">
                  <li><Link to="/marketplace" className="hover:text-ink transition-colors">Browse all</Link></li>
                  <li><Link to="/marketplace?category=phones" className="hover:text-ink transition-colors">Phones</Link></li>
                  <li><Link to="/marketplace?category=laptops" className="hover:text-ink transition-colors">Laptops</Link></li>
                  <li><Link to="/marketplace?category=cameras" className="hover:text-ink transition-colors">Cameras</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-ink mb-4 text-sm">Account</h4>
                <ul className="space-y-2.5 text-sm text-ink-muted">
                  <li><Link to="/auth" className="hover:text-ink transition-colors">Sign in</Link></li>
                  <li><Link to="/create" className="hover:text-ink transition-colors">Sell an item</Link></li>
                  <li><Link to="/favorites" className="hover:text-ink transition-colors">Favorites</Link></li>
                  <li><Link to="/messages" className="hover:text-ink transition-colors">Messages</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-ink mb-4 text-sm">Support</h4>
                <ul className="space-y-2.5 text-sm text-ink-muted">
                  <li><Link to="/help" className="hover:text-ink transition-colors">Help center</Link></li>
                  <li><Link to="/safety" className="hover:text-ink transition-colors">Safety tips</Link></li>
                  <li><Link to="/terms" className="hover:text-ink transition-colors">Terms of service</Link></li>
                  <li><Link to="/privacy" className="hover:text-ink transition-colors">Privacy policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-line flex flex-col gap-5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-ink-faint text-sm">
                  &copy; {new Date().getFullYear()} TechMart. All rights reserved.
                </p>
                <Link
                  to="/marketplace"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-navy-600 transition-colors"
                >
                  Start browsing
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="text-ink-faint text-sm">Developed by</span>
                <img
                  src="/images/nmp-technologies.png"
                  alt="NMP Technologies"
                  className="h-12 w-auto object-contain rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

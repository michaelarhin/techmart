import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import OnboardingTour from './components/OnboardingTour';
import Layout from './components/Layout';

// Route-level code splitting keeps the initial bundle small.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const Profile = lazy(() => import('./pages/Profile'));
const Auth = lazy(() => import('./pages/Auth'));
const Messages = lazy(() => import('./pages/Messages'));
const Favorites = lazy(() => import('./pages/Favorites'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const SafetyTips = lazy(() => import('./pages/SafetyTips'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-[3px] border-line border-t-navy-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <OnboardingTour />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="listing/:id" element={<ListingDetail />} />
                <Route path="create" element={<CreateListing />} />
                <Route path="listing/:id/edit" element={<CreateListing />} />
                <Route path="profile/:id?" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="admin" element={<Admin />} />
                <Route path="messages" element={<Messages />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="help" element={<HelpCenter />} />
                <Route path="safety" element={<SafetyTips />} />
                <Route path="terms" element={<Terms />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

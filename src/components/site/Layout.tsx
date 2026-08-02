import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HunterOnboarding from './HunterOnboarding';
import ScrollToTop from './ScrollToTop';
import { useHunter } from '@/hooks/use-hunter';

const Layout = () => {
  const { authOpen, setAuthOpen, handleComplete } = useHunter();

  return (
    <div className="min-h-screen bg-hero-bg font-body text-hero-text">
      <ScrollToTop />
      <Header onStart={() => setAuthOpen(true)} />
      <Outlet />
      <Footer onStart={() => setAuthOpen(true)} />
      <HunterOnboarding open={authOpen} onOpenChange={setAuthOpen} onComplete={handleComplete} />
    </div>
  );
};

export default Layout;
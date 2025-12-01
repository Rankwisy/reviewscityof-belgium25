import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Menu, X, Mail, Facebook, Instagram, Twitter, Heart, Calendar, Briefcase, Trophy, Plus, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageProvider, useLanguage } from './pages/LanguageContext';
import { useTranslation } from './pages/translations';
import LanguageSwitcher from './components/LanguageSwitcher';
import AchievementNotification from './components/gamification/AchievementNotification';
import { useAchievements } from './components/gamification/useAchievements';
import { canAccessAdmin } from './functions/permissions';
import TravelAssistant from './components/ai/TravelAssistant';
import MegaMenu from './components/navigation/MegaMenu';
import GlobalSearch from './components/search/GlobalSearch';

function LayoutContent({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [isCustomAdmin, setIsCustomAdmin] = useState(false);
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { notifications, removeNotification } = useAchievements(user);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global search keyboard shortcut (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (window.base44 && typeof window.base44.auth.me === 'function') {
      window.base44.auth.me().then(setUser).catch(() => setUser(null));
    } else {
      console.warn("base44.auth.me() not found. User authentication will not work.");
    }
    
    // Check custom admin auth from localStorage
    const adminAuth = localStorage.getItem('adminAuthenticated');
    setIsCustomAdmin(adminAuth === 'true');
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUsername');
    setIsCustomAdmin(false);
    window.location.href = '/';
  };

  // Check if user has admin access (Base44 or custom admin)
  const hasAdminAccess = (user && canAccessAdmin(user)) || isCustomAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --primary-orange: #F38F0C;
          --primary-yellow: #FECB4D;
          --primary-dark: #292F33;
          --secondary-gray: #485358;
          --accent-brown: #936B31;
          --near-black: #010101;
          
          --gradient-warm: linear-gradient(135deg, #F38F0C 0%, #FECB4D 100%);
          --gradient-dark: linear-gradient(135deg, #292F33 0%, #485358 100%);
          --gradient-glow: linear-gradient(135deg, rgba(243, 143, 12, 0.1) 0%, rgba(254, 203, 77, 0.1) 100%);
          
          --font-display: 'Playfair Display', serif;
          --font-body: 'Outfit', sans-serif;
          --font-ui: 'Inter', sans-serif;
          
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
          --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);
          
          --glass-bg: rgba(255, 255, 255, 0.4);
          --glass-border: rgba(255, 255, 255, 0.15);
        }

        * {
          font-family: var(--font-body);
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-display);
        }

        .glass-effect {
          background: var(--glass-bg);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--glass-border);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: var(--shadow-xl);
        }

        .text-gradient {
          background: var(--gradient-warm);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
          background-size: 1000px 100%;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(243, 143, 12, 0.3); }
          50% { box-shadow: 0 0 40px rgba(243, 143, 12, 0.6); }
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #F38F0C 0%, #FECB4D 50%, #936B31 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .organic-blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: morph 8s ease-in-out infinite;
        }

        @keyframes morph {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
          50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
        }
      `}</style>

      {/* Achievement Notifications */}
      <div className="fixed top-24 right-4 z-50 space-y-4">
        {notifications.map((notification, index) => (
          <AchievementNotification
            key={notification.id}
            achievement={notification}
            onClose={() => removeNotification(index)}
          />
        ))}
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center space-x-3 group flex-shrink-0 mr-4">
              <img 
                src="https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/android-chrome-512x512.png?updatedAt=1762899271840" 
                alt="CityReview Logo" 
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="whitespace-nowrap hidden sm:block">
                <div className="text-2xl font-bold gradient-text">
                  CityReview
                </div>
                <div className="text-xs text-gray-500 font-medium">Discover Belgium</div>
              </div>
            </Link>

            {/* Desktop Navigation - Mega Menu + Language Switcher */}
            <div className="hidden lg:flex items-center space-x-3 flex-1 justify-end">
              <MegaMenu />
              
              <div className="h-6 w-px bg-gray-300 mx-1"></div>
              
              <Link to={createPageUrl('Blog')} className="text-gray-700 hover:text-[var(--primary-orange)] transition-all duration-300 font-medium relative group px-2">
                {t('nav.blog')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              {user && (
                <>
                  <Link to={createPageUrl('UserProfile')} className="text-gray-700 hover:text-[var(--primary-orange)] transition-all duration-300 font-medium relative group px-1">
                    <User className="h-5 w-5" />
                  </Link>
                  <Link to={createPageUrl('MyFavorites')} className="text-gray-700 hover:text-[var(--primary-orange)] transition-all duration-300 font-medium px-1">
                    <Heart className="h-5 w-5" />
                  </Link>
                  <Link to={createPageUrl('MyItineraries')} className="text-gray-700 hover:text-[var(--primary-orange)] transition-all duration-300 font-medium px-1">
                    <Calendar className="h-5 w-5" />
                  </Link>
                </>
              )}
              
              <div className="h-6 w-px bg-gray-300 mx-1"></div>
              
              {/* Language Switcher - More prominent */}
              <LanguageSwitcher />
              
              <Link to={createPageUrl('SubmitListing')}>
                <Button size="sm" className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:shadow-lg transition-all duration-300 hover:scale-105 text-white border-0 ml-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Listing
                </Button>
              </Link>
              {hasAdminAccess && (
                <>
                  <Link to={createPageUrl('AdminDashboard')}>
                    <Button size="sm" variant="outline" className="hover:shadow-lg transition-all duration-300">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isCustomAdmin && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAdminLogout}
                      className="hover:shadow-lg transition-all duration-300 text-red-600 hover:text-red-700"
                    >
                      Logout
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button
                className="text-gray-700 hover:text-[var(--primary-orange)] transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-effect border-t animate-in slide-in-from-top duration-300">
            <div className="px-4 py-4 space-y-3">
              <Link 
                to={createPageUrl('Cities')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.cities')}
              </Link>
              <Link 
                to={createPageUrl('Attractions')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.attractions')}
              </Link>
              <Link 
                to={createPageUrl('Restaurants')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.restaurants')}
              </Link>
              <Link 
                to={createPageUrl('Hotels')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.hotels')}
              </Link>
              <Link 
                to={createPageUrl('LocalServices')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Local Services
              </Link>
              <Link 
                to={createPageUrl('Events')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to={createPageUrl('Blog')} 
                className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.blog')}
              </Link>
              {user && (
                <>
                  <Link 
                    to={createPageUrl('UserProfile')} 
                    className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to={createPageUrl('MyFavorites')} 
                    className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Favorites
                  </Link>
                  <Link 
                    to={createPageUrl('MyItineraries')} 
                    className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Itineraries
                  </Link>
                  {hasAdminAccess && (
                    <>
                      <Link 
                        to={createPageUrl('AdminDashboard')} 
                        className="block py-2 text-gray-700 hover:text-[var(--primary-orange)] font-medium transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      {isCustomAdmin && (
                        <button
                          onClick={() => {
                            handleAdminLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="block py-2 text-red-600 hover:text-red-700 font-medium transition-colors text-left w-full"
                        >
                          Admin Logout
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Global Search Modal - Accessible via Floating Button */}
      <GlobalSearch isOpen={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />

      {/* AI Travel Assistant */}
      <TravelAssistant />

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[var(--primary-dark)] via-[var(--secondary-gray)] to-[var(--near-black)] text-white mt-20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary-orange)] opacity-5 organic-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--primary-yellow)] opacity-5 organic-blob" style={{animationDelay: '2s'}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Logo & About */}
            <div>
              <Link to={createPageUrl('Home')} className="flex items-center space-x-3 mb-6 group">
                <img 
                  src="https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/android-chrome-512x512.png?updatedAt=1762899271840" 
                  alt="CityReview.be Logo" 
                  className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <div>
                  <div className="text-xl font-bold text-white">CityReview</div>
                  <div className="text-xs text-gray-400">Discover Belgium</div>
                </div>
              </Link>
              <h3 className="text-lg font-bold mb-4 text-[var(--primary-yellow)]">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('Contact')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">{t('footer.contact')}</Link></li>
                <li><Link to={createPageUrl('LocalServices')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Local Services</Link></li>
                <li><a href="#" className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">{t('footer.privacy')}</a></li>
                <li>
                  <Link to={createPageUrl('AdminLogin')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[var(--primary-yellow)]">{t('footer.popularCities')}</h3>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('CityDetail') + '?city=brussels'} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Brussels</Link></li>
                <li><Link to={createPageUrl('CityDetail') + '?city=bruges'} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Bruges</Link></li>
                <li><Link to={createPageUrl('CityDetail') + '?city=antwerp'} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Antwerp</Link></li>
                <li><Link to={createPageUrl('CityDetail') + '?city=ghent'} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Ghent</Link></li>
                <li><Link to={createPageUrl('Cities')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">{t('footer.viewAllCities')}</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[var(--primary-yellow)]">{t('footer.resources')}</h3>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('Events')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Events</Link></li>
                <li><Link to={createPageUrl('BelgianCulture')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Belgian Culture</Link></li>
                <li><Link to={createPageUrl('ChristmasMarkets')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Christmas Markets</Link></li>
                <li><Link to={createPageUrl('Blog')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">{t('footer.blog')}</Link></li>
                <li><Link to={createPageUrl('SubmitListing')} className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:translate-x-1 inline-block">Submit Listing</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[var(--primary-yellow)]">{t('footer.stayConnected')}</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:scale-110">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:scale-110">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-[var(--primary-yellow)] transition-all duration-300 hover:scale-110">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">{t('footer.newsletter')}</p>
                <div className="flex">
                  <Input 
                    type="email" 
                    placeholder={t('footer.emailPlaceholder')}
                    className="rounded-r-none bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--primary-orange)] transition-all"
                  />
                  <Button className="rounded-l-none bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:shadow-lg transition-all duration-300 border-0">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p className="flex items-center justify-center gap-2">
              © 2025 CityReview - {t('footer.madeWith')}
              <Heart className="h-4 w-4 text-[var(--primary-orange)] animate-pulse" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}
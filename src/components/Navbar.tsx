import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, User } from 'lucide-react';
import { useAuth } from "@/firebase/AuthContext";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { t } = useTranslation();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  // Verifica se siamo nell'AdminPanel
  const isAdminPanel = location.pathname.startsWith('/admin');
  
  // Verifica se siamo nella Dashboard utente
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  // Nascondi l'hamburger menu se siamo in admin panel o dashboard
  const shouldHideHamburger = isAdminPanel || isDashboard;

  // Handler per il link Contatti
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    
    if (location.pathname === '/') {
      // Se siamo già sulla homepage, scrolla alla sezione contatti
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Se non siamo sulla homepage, naviga prima alla home e poi scrolla
      navigate('/');
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };
  
  const navItems = [
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.mission'), path: '/mission' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.contact'), path: '/#contact', isContact: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-2xl font-display font-bold text-brand-blue">
              3D<span className="text-brand-accent">MAKES</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            item.isContact ? (
              <button
                key={item.path}
                onClick={handleContactClick}
                className={`font-medium transition-colors hover:text-brand-accent ${
                  location.pathname === '/' && location.hash === '#contact' ? 'text-brand-accent' : 'text-foreground'
                }`}
              >
                {item.name}
              </button>
            ) : (
              <Link 
                key={item.path} 
                to={item.path}
                className={`font-medium transition-colors hover:text-brand-accent ${
                  isActive(item.path) ? 'text-brand-accent' : 'text-foreground'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Button asChild variant="outline">
              <Link to="/calculator">{t('nav.requestQuote')}</Link>
            </Button>
            
            {/* Mostra Area Clienti solo se non siamo nell'AdminPanel */}
            {!isAdminPanel && (
              <Button asChild>
                <Link to={currentUser ? "/dashboard" : "/login"}>
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.clientArea')}
                </Link>
              </Button>
            )}
            
            {/* Mostra Admin solo se l'utente è admin e non siamo già nell'AdminPanel */}
            {isAdmin && !isAdminPanel && (
              <Button asChild variant="outline" className="border-brand-accent text-brand-accent hover:bg-brand-accent/10">
                <Link to="/admin">{t('nav.admin')}</Link>
              </Button>
            )}
          </div>
        </nav>
        
        {/* Mobile controls */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Language selector sempre visibile su mobile */}
          <div className="scale-90">
            <LanguageSelector />
          </div>
          
          {/* Mobile menu button - nascosto se siamo in admin panel o dashboard */}
          {!shouldHideHamburger && (
            <button 
              className="rounded-md p-2 text-foreground focus:outline-none"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile navigation - nascosto se siamo in admin panel o dashboard */}
      {isOpen && !shouldHideHamburger && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container-custom py-4 space-y-4">
            {navItems.map((item) => (
              item.isContact ? (
                <button
                  key={item.path}
                  onClick={handleContactClick}
                  className={`block py-2 w-full text-left font-medium transition-colors hover:text-brand-accent ${
                    location.pathname === '/' && location.hash === '#contact' ? 'text-brand-accent' : 'text-foreground'
                  }`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 font-medium transition-colors hover:text-brand-accent ${
                    isActive(item.path) ? 'text-brand-accent' : 'text-foreground'
                  }`}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              )
            ))}
            <div className="pt-4 space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link to="/calculator">{t('nav.requestQuote')}</Link>
              </Button>
              
              {/* Mostra Area Clienti solo se non siamo nell'AdminPanel */}
              {!isAdminPanel && (
                <Button asChild className="w-full">
                  <Link to={currentUser ? "/dashboard" : "/login"} onClick={closeMenu}>
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.clientArea')}
                  </Link>
                </Button>
              )}
              
              {/* Mostra Admin solo se l'utente è admin e non siamo già nell'AdminPanel */}
              {isAdmin && !isAdminPanel && (
                <Button asChild variant="outline" className="w-full border-brand-accent text-brand-accent hover:bg-brand-accent/10">
                  <Link to="/admin" onClick={closeMenu}>{t('nav.admin')}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

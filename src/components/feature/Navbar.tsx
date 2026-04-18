import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img
            src="https://public.readdy.ai/ai/img_res/9d651c59-ccb2-43f8-b293-20cb5f9f6a37.png"
            alt="Mini Cine Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              scrolled
                ? isActive('/') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
                : isActive('/') ? 'text-teal-300' : 'text-white/90 hover:text-white'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/reservas"
            className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              scrolled
                ? isActive('/reservas') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'
                : isActive('/reservas') ? 'text-teal-300' : 'text-white/90 hover:text-white'
            }`}
          >
            Reservar
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium px-4 py-2 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
              scrolled
                ? 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
                : 'border-white/70 text-white hover:bg-white/20'
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={`text-xl ${menuOpen ? 'ri-close-line' : 'ri-menu-line'}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`text-sm font-medium py-2 cursor-pointer whitespace-nowrap ${isActive('/') ? 'text-teal-600' : 'text-gray-700'}`}
          >
            Inicio
          </Link>
          <Link
            to="/reservas"
            onClick={() => setMenuOpen(false)}
            className={`text-sm font-medium py-2 cursor-pointer whitespace-nowrap ${isActive('/reservas') ? 'text-teal-600' : 'text-gray-700'}`}
          >
            Reservar
          </Link>
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium py-2 text-teal-600 cursor-pointer whitespace-nowrap"
          >
            Panel Admin
          </Link>
        </div>
      )}
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5EAEF] py-3.5 shadow-xs'
          : 'bg-white/80 backdrop-blur-md border-b border-[#E5EAEF]/70 py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-9 rounded-lg bg-[#5D87FF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              C⟳
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-[#2A3547]">
                CARBON<span className="text-[#5D87FF]">LOOP</span>
              </span>
              <span className="text-[10px] tracking-wider text-[#5A6A85] uppercase -mt-1 font-semibold">
                Industrial Network
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/marketplace"
              className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] hover:text-[#5D87FF] transition-colors"
            >
              Marketplace
            </Link>
            <Link
              to="/requirements"
              className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] hover:text-[#5D87FF] transition-colors"
            >
              Demand Network
            </Link>
            <Link
              to="/how-it-works"
              className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] hover:text-[#5D87FF] transition-colors"
            >
              Match Engine
            </Link>
            <Link
              to="/impact"
              className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] hover:text-[#5D87FF] transition-colors"
            >
              Impact Analytics
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="text-xs font-semibold uppercase text-[#5D87FF] px-4 py-2 border border-[#5D87FF]/30 rounded-lg bg-[#ECF2FF] flex items-center gap-2 transition-colors hover:bg-[#5D87FF] hover:text-white"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Console ({user?.firstName || 'Dashboard'})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold uppercase text-[#5A6A85] hover:text-[#2A3547] transition-colors px-3 py-2"
              >
                Sign In
              </Link>
            )}
            <Button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{isAuthenticated ? 'Enter Console' : 'Launch Platform'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#2A3547] hover:bg-[#F6F9FC] rounded-lg"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5EAEF] px-4 py-6">
          <nav className="flex flex-col gap-4 mb-6">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase text-[#2A3547]"
            >
              Marketplace
            </Link>
            <Link
              to="/requirements"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase text-[#2A3547]"
            >
              Demand Network
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase text-[#2A3547]"
            >
              Match Engine
            </Link>
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase text-[#2A3547]"
            >
              Impact
            </Link>
          </nav>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold uppercase bg-[#5D87FF] text-white rounded-lg flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Console ({user?.firstName || 'Dashboard'})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold uppercase border border-[#E5EAEF] text-[#2A3547] rounded-lg"
              >
                Sign In
              </Link>
            )}
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/marketplace');
              }}
              className="w-full bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold py-2.5 rounded-lg cursor-pointer"
            >
              Explore Marketplace
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

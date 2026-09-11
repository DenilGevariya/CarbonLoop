import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
          ? 'bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E2DDD5] py-3.5 shadow-xs dark:bg-[#121513]/95 dark:border-white/10'
          : 'bg-[#F7F5EF]/90 backdrop-blur-md border-b border-[#E2DDD5]/70 py-4.5 dark:bg-[#121513]/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded border border-[#173D32] bg-[#173D32] text-[#F7F5EF] flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-2xs">
              C⟳
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-lg tracking-tight text-[#171A18] dark:text-[#F2F0EB]">
                CARBON<span className="text-[#3C6E5C]">LOOP</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider text-[#5C625E] uppercase -mt-1 font-semibold">
                Industrial Network
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/marketplace"
              className="text-xs font-mono tracking-wider uppercase text-[#5C625E] hover:text-[#173D32] dark:hover:text-[#F2F0EB] transition-colors font-medium"
            >
              Marketplace
            </Link>
            <a
              href="/#problem"
              className="text-xs font-mono tracking-wider uppercase text-[#5C625E] hover:text-[#173D32] dark:hover:text-[#F2F0EB] transition-colors font-medium"
            >
              Infrastructure
            </a>
            <Link
              to="/how-it-works"
              className="text-xs font-mono tracking-wider uppercase text-[#5C625E] hover:text-[#173D32] dark:hover:text-[#F2F0EB] transition-colors font-medium"
            >
              How it works
            </Link>
            <a
              href="/#matching"
              className="text-xs font-mono tracking-wider uppercase text-[#5C625E] hover:text-[#173D32] dark:hover:text-[#F2F0EB] transition-colors font-medium"
            >
              Matching
            </a>
            <Link
              to="/impact"
              className="text-xs font-mono tracking-wider uppercase text-[#5C625E] hover:text-[#173D32] dark:hover:text-[#F2F0EB] transition-colors font-medium"
            >
              Impact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-mono tracking-wider uppercase text-[#173D32] font-semibold dark:text-[#F2F0EB] hover:text-[#133027] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-[#173D32] hover:bg-[#133027] text-[#F7F5EF] font-sans font-medium text-xs tracking-wide px-4 py-2 rounded-sm border border-[#173D32] transition-all flex items-center gap-2 group shadow-2xs cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#171A18] dark:text-[#F2F0EB] hover:bg-[#EFECE4] dark:hover:bg-white/5 rounded"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F5EF] border-b border-[#E2DDD5] px-4 py-6 dark:bg-[#121513] dark:border-white/10">
          <nav className="flex flex-col gap-4 mb-6">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase text-[#171A18] dark:text-[#F2F0EB] font-medium"
            >
              Marketplace
            </Link>
            <a
              href="/#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase text-[#171A18] dark:text-[#F2F0EB] font-medium"
            >
              Infrastructure
            </a>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase text-[#171A18] dark:text-[#F2F0EB] font-medium"
            >
              How it works
            </Link>
            <a
              href="/#matching"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase text-[#171A18] dark:text-[#F2F0EB] font-medium"
            >
              Matching
            </a>
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-mono uppercase text-[#171A18] dark:text-[#F2F0EB] font-medium"
            >
              Impact
            </Link>
          </nav>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full text-center py-2.5 text-xs font-mono uppercase border border-[#E2DDD5] text-[#171A18] dark:text-[#F2F0EB] font-semibold"
            >
              Sign In
            </Link>
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/marketplace');
              }}
              className="w-full bg-[#173D32] text-[#F7F5EF] text-xs font-medium py-2.5 cursor-pointer"
            >
              Explore Marketplace
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Factory, Package, FileText, Truck, ShieldCheck, ShoppingCart, ArrowRight, X } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { GlobalSearchResultItem } from '../api/adminApi';

interface GlobalCommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCommandSearch: React.FC<GlobalCommandSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await adminApi.searchGlobal(query);
        if (Array.isArray(res)) {
          setResults(res);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GlobalSearchResultItem) => {
    onClose();
    navigate(item.url);
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderIcon = (category: string) => {
    switch (category) {
      case 'ORGANIZATION':
        return <Building2 className="w-4 h-4 text-[#5D87FF]" />;
      case 'FACILITY':
        return <Factory className="w-4 h-4 text-[#FFAE1F]" />;
      case 'LISTING':
        return <Package className="w-4 h-4 text-[#13DEB9]" />;
      case 'REQUIREMENT':
        return <FileText className="w-4 h-4 text-[#5D87FF]" />;
      case 'ORDER':
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      case 'SHIPMENT':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-[#13DEB9]" />;
      default:
        return <Search className="w-4 h-4 text-[#5A6A85]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#2A3547]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#F6F9FC] border border-[#E5EAEF] shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyNavigation}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#E5EAEF] bg-white gap-3">
          <Search className="w-5 h-5 text-[#5A6A85] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-[#2A3547] placeholder-[#5A6A85]/70 text-sm font-medium focus:outline-none"
            placeholder="Search organizations, facilities, listings, orders, shipments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-[#5A6A85] bg-[#F6F9FC] border border-[#E5EAEF] rounded">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC] transition-colors p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading && (
            <div className="p-8 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
              Searching CarbonLoop Enterprise Database...
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-[#5A6A85]">
              <p className="text-sm font-medium text-[#2A3547]">No matching entities found</p>
              <p className="text-xs text-[#5A6A85] mt-1">Try searching by company name, facility city, order number, or shipment code.</p>
            </div>
          )}

          {!isLoading && !query.trim() && (
            <div className="p-6 text-[#5A6A85] text-xs">
              <span className="font-semibold text-[#2A3547] block mb-2 uppercase tracking-wider text-[11px]">Quick Admin Shortcuts</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { onClose(); navigate('/admin/organizations'); }} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E5EAEF] bg-white hover:bg-[#F6F9FC] transition-colors text-left text-xs font-semibold text-[#2A3547]">
                  <Building2 className="w-4 h-4 text-[#5D87FF]" /> Manage Organizations
                </button>
                <button onClick={() => { onClose(); navigate('/admin/users'); }} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E5EAEF] bg-white hover:bg-[#F6F9FC] transition-colors text-left text-xs font-semibold text-[#2A3547]">
                  <ShieldCheck className="w-4 h-4 text-[#13DEB9]" /> Platform User Access
                </button>
                <button onClick={() => { onClose(); navigate('/admin/matches'); }} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E5EAEF] bg-white hover:bg-[#F6F9FC] transition-colors text-left text-xs font-semibold text-[#2A3547]">
                  <FileText className="w-4 h-4 text-[#5D87FF]" /> Match Score Debugger
                </button>
                <button onClick={() => { onClose(); navigate('/admin/health'); }} className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E5EAEF] bg-white hover:bg-[#F6F9FC] transition-colors text-left text-xs font-semibold text-[#2A3547]">
                  <Factory className="w-4 h-4 text-[#FFAE1F]" /> System Health Diagnostics
                </button>
              </div>
            </div>
          )}

          {!isLoading &&
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'bg-[#5D87FF] text-white shadow-xs' : 'bg-white border border-[#E5EAEF] hover:bg-[#F6F9FC] text-[#2A3547]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-[#F6F9FC]'}`}>
                      {renderIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        {item.status && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#F6F9FC] text-[#5A6A85] border border-[#E5EAEF]'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[#5A6A85]'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-2">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${isSelected ? 'text-white/90' : 'text-[#5A6A85]'}`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#5A6A85]'}`} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#E5EAEF] bg-[#F6F9FC] text-[11px] text-[#5A6A85] flex items-center justify-between font-medium">
          <span>Use ↑ ↓ keys to navigate, Enter to select</span>
          <span>CarbonLoop Global Admin Registry</span>
        </div>
      </div>
    </div>
  );
};

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
        return <Building2 className="w-4 h-4 text-[#173D32]" />;
      case 'FACILITY':
        return <Factory className="w-4 h-4 text-amber-700" />;
      case 'LISTING':
        return <Package className="w-4 h-4 text-emerald-700" />;
      case 'REQUIREMENT':
        return <FileText className="w-4 h-4 text-blue-700" />;
      case 'ORDER':
        return <ShoppingCart className="w-4 h-4 text-indigo-700" />;
      case 'SHIPMENT':
        return <Truck className="w-4 h-4 text-purple-700" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-teal-700" />;
      default:
        return <Search className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#171A18]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FAF8F5] border border-[#E2DDD5] shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyNavigation}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#E2DDD5] bg-white gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-[#171A18] placeholder-stone-400 text-sm font-medium focus:outline-none"
            placeholder="Search organizations, facilities, listings, orders, shipments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-stone-500 bg-stone-100 border border-stone-300 rounded font-mono">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading && (
            <div className="p-8 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
              Searching CarbonLoop Enterprise Database...
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-stone-500">
              <p className="text-sm font-medium">No matching entities found</p>
              <p className="text-xs text-stone-400 mt-1">Try searching by company name, facility city, order number, or shipment code.</p>
            </div>
          )}

          {!isLoading && !query.trim() && (
            <div className="p-6 text-stone-500 text-xs">
              <span className="font-semibold text-stone-700 block mb-2 uppercase tracking-wider text-[11px]">Quick Admin Shortcuts</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { onClose(); navigate('/admin/organizations'); }} className="flex items-center gap-2 p-2 rounded border border-[#E2DDD5] bg-white hover:bg-[#F4F0EA] transition-colors text-left text-xs font-medium text-stone-800">
                  <Building2 className="w-4 h-4 text-[#173D32]" /> Manage Organizations
                </button>
                <button onClick={() => { onClose(); navigate('/admin/users'); }} className="flex items-center gap-2 p-2 rounded border border-[#E2DDD5] bg-white hover:bg-[#F4F0EA] transition-colors text-left text-xs font-medium text-stone-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" /> Platform User Access
                </button>
                <button onClick={() => { onClose(); navigate('/admin/matches'); }} className="flex items-center gap-2 p-2 rounded border border-[#E2DDD5] bg-white hover:bg-[#F4F0EA] transition-colors text-left text-xs font-medium text-stone-800">
                  <FileText className="w-4 h-4 text-blue-800" /> Match Score Debugger
                </button>
                <button onClick={() => { onClose(); navigate('/admin/health'); }} className="flex items-center gap-2 p-2 rounded border border-[#E2DDD5] bg-white hover:bg-[#F4F0EA] transition-colors text-left text-xs font-medium text-stone-800">
                  <Factory className="w-4 h-4 text-amber-800" /> System Health Diagnostics
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
                    isSelected ? 'bg-[#173D32] text-white shadow-sm' : 'bg-white border border-[#E2DDD5]/60 hover:bg-[#F4F0EA] text-[#171A18]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-white/10' : 'bg-[#FAF8F5]'}`}>
                      {renderIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        {item.status && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded uppercase ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? 'text-emerald-300' : 'text-stone-400'}`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#E2DDD5] bg-[#F4F0EA] text-[11px] text-stone-500 flex items-center justify-between font-mono">
          <span>Use ↑ ↓ keys to navigate, Enter to select</span>
          <span>CarbonLoop Global Admin Registry</span>
        </div>
      </div>
    </div>
  );
};

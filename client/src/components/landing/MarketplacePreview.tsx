import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { MapPin, ArrowRight, Activity, Filter } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/animations';

const mockListings = [
  {
    id: 'list-1',
    category: 'Cement',
    organization: 'TerraCem Industries',
    facility: 'Ahmedabad Industrial Cluster',
    quantity: '1,250 t/mo',
    purity: '99.5%',
    pressure: '25 bar',
    price: '₹4,800/t',
    location: 'Ahmedabad, GJ',
    state: 'LIQUID',
    matchScore: 94,
    status: 'ACTIVE SUPPLY',
    image: INDUSTRIAL_IMAGES.cementPlant
  },
  {
    id: 'list-2',
    category: 'Steel',
    organization: 'NovaSteel Energy',
    facility: 'Hazira Coastal Complex',
    quantity: '3,400 t/mo',
    purity: '98.2%',
    pressure: '16 bar',
    price: '₹4,200/t',
    location: 'Surat, GJ',
    state: 'GASEOUS',
    matchScore: 89,
    status: 'ACTIVE SUPPLY',
    image: INDUSTRIAL_IMAGES.steelPlant
  },
  {
    id: 'list-3',
    category: 'Power',
    organization: 'GreenForge Materials',
    facility: 'Vadodara Chemical Zone',
    quantity: '850 t/mo',
    purity: '99.1%',
    pressure: '20 bar',
    price: '₹5,100/t',
    location: 'Vadodara, GJ',
    state: 'LIQUID',
    matchScore: 92,
    status: 'SPOT READY',
    image: INDUSTRIAL_IMAGES.pipeline
  },
  {
    id: 'list-4',
    category: 'Chemical',
    organization: 'CarbonArc Fuels',
    facility: 'Dahej Petrochemical Terminal',
    quantity: '2,100 t/mo',
    purity: '99.8%',
    pressure: '30 bar',
    price: '₹5,500/t',
    location: 'Dahej, GJ',
    state: 'SUPERCRITICAL',
    matchScore: 96,
    status: 'HIGH PURITY',
    image: INDUSTRIAL_IMAGES.refineryPipes
  }
];

export const MarketplacePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const categories = ['all', 'Cement', 'Steel', 'Power', 'Chemical'];

  const filteredListings = activeTab === 'all'
    ? mockListings
    : mockListings.filter(l => l.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <section className="py-24 px-4 md:px-8 bg-[#F7F5EF] text-[#171A18] relative border-t border-[#E2DDD5]">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-[#E2DDD5]">
          <SectionHeading
            align="left"
            eyebrow="Live Stream Directory"
            eyebrowIcon={Activity}
            title="Active CO₂ Commodity"
            highlightTitle="Exchange."
            description="Explore verified industrial carbon streams with real-time pressure, purity, and volume specifications."
          />

          <Button
            onClick={() => navigate('/marketplace')}
            className="bg-[#173D32] hover:bg-[#255244] text-white font-bold text-sm px-6 py-3 rounded-none flex items-center gap-2 border border-[#173D32]"
          >
            Open Full Marketplace <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2DDD5]/60">
          <span className="text-xs font-mono text-[#5C6560] uppercase mr-3 flex items-center gap-1.5">
            <Filter className="size-3" /> Sector Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-colors rounded-none border ${
                activeTab.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#173D32] text-white border-[#173D32]'
                  : 'bg-[#EBE7DF] text-[#5C6560] border-[#DCD6C9] hover:bg-[#E2DDD5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Commodity Exchange Table / Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredListings.map((item) => (
            <StaggerItem key={item.id}>
              <div className="bg-[#FAF8F5] border border-[#E2DDD5] flex flex-col justify-between h-full group hover:border-[#173D32] transition-all">
                
                {/* Photo & Badge */}
                <div className="relative h-44 overflow-hidden border-b border-[#E2DDD5]">
                  <img
                    src={item.image}
                    alt={item.facility}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171A18]/80 via-[#171A18]/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#173D32] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="bg-[#EBE7DF]/90 text-[#171A18] text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                      {item.state}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-mono text-[#A3B899] font-bold">
                      MATCH SCORE {item.matchScore}%
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {item.price}
                    </span>
                  </div>
                </div>

                {/* Listing Details */}
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h4 className="text-base font-bold text-[#171A18] leading-snug">
                      {item.organization}
                    </h4>
                    <p className="text-xs font-mono text-[#5C6560] flex items-center gap-1 mt-1">
                      <MapPin className="size-3 text-[#173D32]" /> {item.facility}
                    </p>
                  </div>

                  {/* Technical Matrix */}
                  <div className="grid grid-cols-3 gap-2 bg-[#EBE7DF]/60 p-3 border border-[#DCD6C9] font-mono text-center">
                    <div>
                      <span className="text-[10px] text-[#5C6560] uppercase block">Volume</span>
                      <span className="text-xs font-bold text-[#171A18]">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5C6560] uppercase block">Purity</span>
                      <span className="text-xs font-bold text-[#173D32]">{item.purity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5C6560] uppercase block">Pressure</span>
                      <span className="text-xs font-bold text-[#171A18]">{item.pressure}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 border-t border-transparent">
                  <Button
                    onClick={() => navigate('/marketplace')}
                    variant="outline"
                    className="w-full bg-[#EBE7DF] hover:bg-[#173D32] hover:text-white text-[#171A18] border-[#DCD6C9] font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-none flex items-center justify-center gap-2 transition-colors"
                  >
                    Inspect Stream Specs <ArrowRight className="size-3" />
                  </Button>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
};

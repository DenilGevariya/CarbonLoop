import React, { useState } from 'react';
import { MapPin, Factory, Navigation } from 'lucide-react';

export const AdminNetworkMapPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const nodes = [
    {
      id: 'node-dahej',
      name: 'Dahej Petrochemical Industrial Corridor',
      city: 'Dahej',
      state: 'Gujarat',
      lat: 21.7011,
      lng: 72.5925,
      type: 'EMITTER_HUB',
      activeListings: 4,
      availableVolume: '14,200 t/mo',
      topPurity: '99.7%',
      status: 'HEALTHY',
    },
    {
      id: 'node-hazira',
      name: 'Hazira Fertilizer & Power Node',
      city: 'Hazira',
      state: 'Gujarat',
      lat: 21.1175,
      lng: 72.6455,
      type: 'EMITTER_HUB',
      activeListings: 3,
      availableVolume: '8,500 t/mo',
      topPurity: '99.5%',
      status: 'HEALTHY',
    },
    {
      id: 'node-vadodara',
      name: 'Vadodara Chemical Utilization Cluster',
      city: 'Vadodara',
      state: 'Gujarat',
      lat: 22.3072,
      lng: 73.1812,
      type: 'BUYER_HUB',
      activeListings: 5,
      availableVolume: '9,800 t/mo Demand',
      topPurity: '99.0%',
      status: 'HEALTHY',
    },
    {
      id: 'node-ahmedabad',
      name: 'Ahmedabad Industrial Park Node',
      city: 'Ahmedabad',
      state: 'Gujarat',
      lat: 23.0225,
      lng: 72.5714,
      type: 'BUYER_HUB',
      activeListings: 2,
      availableVolume: '3,100 t/mo Demand',
      topPurity: '98.5%',
      status: 'HEALTHY',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A18] tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#173D32]" /> Industrial Network Infrastructure Geo-Map
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Geospatial visualization of Gujarat CO₂ capture points, utilization nodes, and active road/rail ISO tanker corridors.
          </p>
        </div>
      </div>

      {/* Main Map Viewport simulation card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#171A18] border border-[#2A2E2C] rounded-xl p-6 min-h-[450px] relative overflow-hidden flex flex-col justify-between text-white shadow-lg">
          {/* Top Bar inside Map */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-[#242826] px-3 py-1.5 rounded-lg border border-[#383D3A] text-xs font-mono">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Gujarat Industrial Corridor Region (Lat 21° - 24° N)</span>
            </div>
            <span className="px-2 py-1 bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono rounded uppercase">
              4 Active Capture Nodes
            </span>
          </div>

          {/* Interactive Geo Node Hotspots */}
          <div className="relative flex-1 my-6 flex items-center justify-center">
            <div className="w-full h-full bg-[#1F2321] rounded-lg border border-[#383D3A]/60 relative p-8 flex items-center justify-around">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 text-center group ${
                    selectedNode?.id === node.id
                      ? 'bg-[#173D32] border-emerald-400 shadow-lg scale-105'
                      : 'bg-[#282D2A] border-[#3D433F] hover:bg-[#323835]'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                      <Factory className="w-5 h-5 text-emerald-300" />
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute top-0 right-0 animate-ping" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono text-white block">{node.city}</span>
                    <span className="text-[10px] text-stone-400 font-mono block">{node.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Footer legend */}
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-[#2A2E2C] pt-3 z-10">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Capture Source
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Utilization Sink
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Active ISO Transit Corridor
            </span>
          </div>
        </div>

        {/* Selected Node Details Card */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-[#171A18] text-sm mb-3 border-b border-[#E2DDD5] pb-2 font-mono uppercase text-stone-600">
              Infrastructure Node Telemetry
            </h3>

            {selectedNode ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">Node Name</span>
                  <span className="font-bold text-[#171A18] text-sm">{selectedNode.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2DDD5]">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase block">Capacity</span>
                    <span className="font-bold text-[#173D32]">{selectedNode.availableVolume}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase block">Max Gas Purity</span>
                    <span className="font-bold text-stone-800">{selectedNode.topPurity}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E2DDD5]">
                  <span className="text-stone-400 text-[10px] uppercase block">Status</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded uppercase">
                    {selectedNode.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 font-mono py-8 text-center">
                Click any node on the map to inspect live pressure, capacity, and gas chromatography purity specs.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

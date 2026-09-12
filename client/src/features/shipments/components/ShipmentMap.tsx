import React from 'react';
import type { RouteStop, ShipmentStatus } from '../api/shipmentApi';
import { MapPin, Truck, Layers, Info } from 'lucide-react';

interface Props {
  routes?: RouteStop[];
  originCity?: string;
  destinationCity?: string;
  distanceKm?: number;
  status?: ShipmentStatus;
  transportMode?: string;
}

export const ShipmentMap: React.FC<Props> = ({
  routes = [],
  originCity = 'Ahmedabad Plant',
  destinationCity = 'Vadodara Facility',
  distanceKm = 120,
  status = 'IN_TRANSIT',
  transportMode = 'ISO_TANK_TRUCK',
}) => {
  const defaultStops = [
    { label: originCity, type: 'ORIGIN', km: '0 km', done: true },
    { label: 'Nadiad Logistics Hub', type: 'WAYPOINT', km: '55 km', done: status !== 'SCHEDULED' },
    { label: destinationCity, type: 'DESTINATION', km: `${distanceKm} km`, done: status === 'DELIVERED' || status === 'COMPLETED' },
  ];

  const stopsToRender = routes.length > 0
    ? routes.map((r, i) => ({
        label: r.location_name,
        type: r.location_type,
        km: i === 0 ? '0 km' : `${Math.round((distanceKm / (routes.length - 1)) * i)} km`,
        done: true,
      }))
    : defaultStops;

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg overflow-hidden mb-6 shadow-sm">
      {/* Map Header Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2DDD5]/80 bg-[#F7F5EF]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#171A18] font-semibold">
          <Layers className="w-4 h-4 text-[#173D32]" />
          <span>GEOSPATIAL ROUTE VISUALIZATION</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#55524D] bg-[#E2DDD5]/40 px-2.5 py-1 rounded">
          <Info className="w-3.5 h-3.5 text-[#173D32]" />
          <span>Indicative Geographic Distance ({distanceKm} km)</span>
        </div>
      </div>

      {/* SVG Canvas Map backdrop */}
      <div className="relative w-full h-[280px] bg-[#171A18] p-6 text-[#F7F5EF] flex flex-col justify-between overflow-hidden">
        {/* Subtle Industrial Grid Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#FAF8F5 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Watermark & Annotations */}
        <div className="relative z-10 flex justify-between items-start text-[11px] font-mono text-[#E2DDD5]/60">
          <div>
            <span className="text-emerald-400 font-bold">CARBONLOOP LOGISTICS LAYER</span>
            <p className="text-[10px] text-neutral-400">CORRIDOR: WEST INDIA INDUSTRIAL ZONE</p>
          </div>
          <div className="text-right">
            <p>MODE: {transportMode.replace(/_/g, ' ')}</p>
            <p>STATUS: <span className="text-[#A3E635] font-semibold">{status}</span></p>
          </div>
        </div>

        {/* Central Geographic Route SVG Line */}
        <div className="relative z-10 my-auto py-6 px-4">
          <div className="relative flex items-center justify-between">
            {/* SVG Connecting Polyline */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              <line
                x1="40"
                y1="0"
                x2="94%"
                y2="0"
                stroke="#173D32"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
              <line
                x1="40"
                y1="0"
                x2={status === 'DELIVERED' || status === 'COMPLETED' ? '94%' : status === 'IN_TRANSIT' || status === 'ARRIVING' ? '60%' : '20%'}
                y2="0"
                stroke="#A3E635"
                strokeWidth="4"
              />
            </svg>

            {/* Stop Nodes */}
            {stopsToRender.map((stop, i) => {
              const isFirst = i === 0;
              const isLast = i === stopsToRender.length - 1;

              return (
                <div key={i} className="relative z-20 flex flex-col items-center group">
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110 ${
                      isFirst
                        ? 'bg-[#173D32] border-[#A3E635] text-white shadow-lg'
                        : isLast
                        ? 'bg-neutral-800 border-emerald-400 text-emerald-400'
                        : 'bg-neutral-900 border-neutral-600 text-neutral-300'
                    }`}
                  >
                    {isFirst ? (
                      <MapPin className="w-5 h-5 text-[#A3E635]" />
                    ) : isLast ? (
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Truck className="w-4 h-4 text-amber-300" />
                    )}
                  </div>

                  {/* Label & Distance Annotation */}
                  <div className="mt-2 text-center">
                    <p className="text-xs font-mono font-bold text-white tracking-wide">{stop.label}</p>
                    <p className="text-[10px] font-mono text-neutral-400">{stop.km}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Technical Disclaimer Bar */}
        <div className="relative z-10 pt-2 border-t border-neutral-800 flex flex-wrap justify-between items-center text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
            <span>LAT/LON BOUNDS: 23.0225° N, 72.5714° E → 22.3072° N, 73.1812° E</span>
          </div>
          <div>INDICATIVE ROUTE ESTIMATION ONLY · NO CELLULAR TELEMETRY SIMULATION</div>
        </div>
      </div>
    </div>
  );
};

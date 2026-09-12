import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../api/analyticsApi';

export const PriceAnalyticsCharts: React.FC = () => {
  const [purityData, setPurityData] = useState<any[]>([]);
  const [pricePointsData, setPricePointsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCharts() {
      try {
        setLoading(true);
        const [purityRes, pointsRes] = await Promise.all([
          analyticsApi.getPriceByPurity(),
          analyticsApi.getTopPricePoints(),
        ]);
        setPurityData(purityRes || []);
        setPricePointsData(pointsRes || []);
      } catch (err) {
        console.error('Failed to load price analytics charts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCharts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 h-72 animate-pulse flex items-center justify-center text-xs text-[#5A6A85]">
          Loading Price vs Purity Chart...
        </div>
        <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 h-72 animate-pulse flex items-center justify-center text-xs text-[#5A6A85]">
          Loading Highest Price Points Chart...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Bar Chart: Average CO2 Price per Tonne based on Purity */}
      <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#2A3547]">CO₂ Purity vs. Average Price</h3>
            <p className="text-[11px] text-[#5A6A85] font-medium">Average price per tonne (₹/t) grouped by purity specification range</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ECF2FF] text-[#5D87FF]">
            LIVE MARKET
          </span>
        </div>

        {purityData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-[#5A6A85]">
            Insufficient price data to generate purity distribution chart.
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAEF" />
                <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5A6A85' }} unit="₹" />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()} / tonne`, 'Avg Price']}
                  contentStyle={{ backgroundColor: '#2A3547', color: '#fff', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="avgPrice" fill="#5D87FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Line Chart: Top / Highest Price Points Timeline */}
      <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#2A3547]">Top Observed Price Points</h3>
            <p className="text-[11px] text-[#5A6A85] font-medium">Highest executed and listed price transactions over time</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F9F5] text-[#13DEB9]">
            PEAK TRADING
          </span>
        </div>

        {pricePointsData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-[#5A6A85]">
            Insufficient transaction history to generate peak price line graph.
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pricePointsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAEF" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5A6A85' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5A6A85' }} unit="₹" />
                <Tooltip
                  formatter={(value: any, _: any, item: any) => [
                    `₹${Number(value).toLocaleString()} / t (${item.payload.company || 'Facility'})`,
                    'Peak Price',
                  ]}
                  contentStyle={{ backgroundColor: '#2A3547', color: '#fff', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="price" stroke="#13DEB9" strokeWidth={2.5} dot={{ r: 4, fill: '#13DEB9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
};

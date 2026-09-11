import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171A18] flex flex-col selection:bg-[#173D32] selection:text-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

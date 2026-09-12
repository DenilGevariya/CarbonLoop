import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#2A3547] flex flex-col font-sans selection:bg-[#5D87FF] selection:text-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

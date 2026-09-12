import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import {
  ArrowRight,
  Factory,
  Cpu,
  ShieldCheck,
  Truck,
  Zap,
  CheckCircle2,
  Activity,
  TrendingUp,
  Lock,
  ChevronRight,
  Building2,
  Flame,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import {
  FadeUp,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  HoverLift,
} from '@/animations';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'emitters' | 'utilizers'>('emitters');

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#2A3547] flex flex-col font-sans selection:bg-[#5D87FF] selection:text-white overflow-x-hidden">
      {/* Header Navbar */}
      <Navbar />

      {/* Main Landing Content */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-24">

        {/* 1. HERO SECTION */}
        <section className="pt-8 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <FadeUp delay={0.1}>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/25 text-[#5D87FF] text-xs font-semibold uppercase tracking-wider shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5D87FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5D87FF]"></span>
                  </span>
                  <span>Enterprise CO₂ Infrastructure Exchange</span>
                  <span className="text-[#5A6A85]/40">•</span>
                  <span className="text-[#13DEB9] font-bold">ISO 14064 Compliant</span>
                </div>
              </FadeUp>

              <FadeUp delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A3547] leading-[1.15]">
                  Accelerate Industrial Decarbonization via{' '}
                  <span className="bg-gradient-to-r from-[#5D87FF] via-[#4570EA] to-[#13DEB9] bg-clip-text text-transparent">
                    Circular CO₂ Monetization
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.3}>
                <p className="text-base sm:text-lg text-[#5A6A85] font-medium leading-relaxed max-w-2xl">
                  CarbonLoop connects verified captured CO₂ emitters with commercial off-takers using deterministic vector compatibility matching, automated purity assays, and live cryogenic telematics.
                </p>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <HoverLift>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-sm px-7 py-3.5 h-13 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <span>Launch Platform Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </HoverLift>

                  <HoverLift y={-2}>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/marketplace')}
                      className="border-[#E5EAEF] bg-white hover:bg-[#F6F9FC] text-[#2A3547] font-semibold text-sm px-6 py-3.5 h-13 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <span>Explore Live Marketplace</span>
                      <ChevronRight className="w-4 h-4 text-[#5A6A85]" />
                    </Button>
                  </HoverLift>
                </div>
              </FadeUp>

              {/* Quick Feature Badges */}
              <FadeUp delay={0.5}>
                <div className="pt-6 border-t border-[#E5EAEF] grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2A3547]">Zero Idle Loss</p>
                      <p className="text-[10px] text-[#5A6A85] font-medium">Direct Stream Sales</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-[#E8F9F5] text-[#13DEB9] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2A3547]">Verified Assays</p>
                      <p className="text-[10px] text-[#5A6A85] font-medium">GC Chromatography</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2A3547]">Cryo Telematics</p>
                      <p className="text-[10px] text-[#5A6A85] font-medium">Live Temp & Pressure</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Right Column: Hero Visual Card with Real Image */}
            <div className="lg:col-span-5 relative">
              <ScaleIn delay={0.2}>
                <div className="relative rounded-2xl overflow-hidden border border-[#E5EAEF] bg-white shadow-xl group">
                  <img
                    src={INDUSTRIAL_IMAGES.heroFacility}
                    alt="Industrial CO2 Capture Facility Infrastructure"
                    className="w-full h-[400px] sm:h-[460px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Glassmorphic Top Overlay Badge */}
                  <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13DEB9] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#13DEB9]"></span>
                      </span>
                      <span className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">
                        STREAM LIVE · 1,250 t/mo
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20">
                      FAC-TC-001
                    </span>
                  </div>

                  {/* Glassmorphic Bottom Floating Spec Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#E5EAEF] shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A3547]">TerraCem Post-Combustion Stream</span>
                      <span className="text-xs font-bold text-[#13DEB9]">99.5% Purity</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#5A6A85]">
                      <span>Gujarat Industrial Corridor</span>
                      <span className="font-bold text-[#5D87FF]">₹4,800 / tonne</span>
                    </div>
                    <div className="w-full bg-[#E5EAEF] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#5D87FF] to-[#13DEB9] h-full w-[94%]" />
                    </div>
                  </div>
                </div>
              </ScaleIn>
            </div>

          </div>
        </section>


        {/* 2. LIVE METRICS COUNTER BAR */}
        <section>
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            
            <StaggerItem>
              <HoverLift y={-3}>
                <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="size-12 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center shrink-0">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">Active Supply</p>
                    <p className="text-2xl font-bold text-[#2A3547]">
                      <AnimatedCounter value={16050} /> <span className="text-xs font-semibold text-[#5A6A85]">tonnes</span>
                    </p>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift y={-3}>
                <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="size-12 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center shrink-0">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">Vector Match Score</p>
                    <p className="text-2xl font-bold text-[#5D87FF]">
                      <AnimatedCounter value={94.5} decimals={1} /> <span className="text-xs font-semibold text-[#5A6A85]">/ 100</span>
                    </p>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift y={-3}>
                <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="size-12 rounded-xl bg-[#E8F9F5] border border-[#13DEB9]/20 text-[#13DEB9] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">ISO Compliance</p>
                    <p className="text-2xl font-bold text-[#2A3547]">
                      <AnimatedCounter value={100} suffix="%" /> <span className="text-xs font-bold text-[#13DEB9]">Verified</span>
                    </p>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift y={-3}>
                <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="size-12 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">Cryo Fleet Fleet</p>
                    <p className="text-2xl font-bold text-[#2A3547]">
                      <AnimatedCounter value={42} suffix=" Tanks" />
                    </p>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>

          </StaggerContainer>
        </section>


        {/* 3. HOW IT WORKS / CIRCULAR PIPELINE */}
        <section className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECF2FF] text-[#5D87FF] text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              Circular Carbon Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2A3547] tracking-tight">
              Four Steps from Flue Gas to Industrial Feedstock
            </h2>
            <p className="text-sm text-[#5A6A85] font-medium leading-relaxed">
              Standardized digital verification, vector compatibility algorithms, and seamless cryogenic logistics.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <StaggerItem>
              <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-4 relative h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-xl bg-[#ECF2FF] text-[#5D87FF] font-bold flex items-center justify-center text-sm border border-[#5D87FF]/20">
                      01
                    </span>
                    <span className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider">ONBOARDING</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2A3547]">Stream Declaration</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Emitters submit certified gas chromatography composition assays, pressure levels, and monthly output metrics.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5EAEF] text-[11px] font-semibold text-[#5D87FF]">
                  Assay Certification →
                </div>
              </div>
            </StaggerItem>

            {/* Step 2 */}
            <StaggerItem>
              <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-4 relative h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-xl bg-[#ECF2FF] text-[#5D87FF] font-bold flex items-center justify-center text-sm border border-[#5D87FF]/20">
                      02
                    </span>
                    <span className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider">MATCH ENGINE</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2A3547]">Vector Compatibility</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Algorithms calculate match scores based on feedstock purity thresholds, freight distance matrices, and delivery schedules.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5EAEF] text-[11px] font-semibold text-[#5D87FF]">
                  Vector Scoring →
                </div>
              </div>
            </StaggerItem>

            {/* Step 3 */}
            <StaggerItem>
              <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-4 relative h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-xl bg-[#ECF2FF] text-[#5D87FF] font-bold flex items-center justify-center text-sm border border-[#5D87FF]/20">
                      03
                    </span>
                    <span className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider">LOGISTICS</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2A3547]">Cryogenic Transport</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Live IoT sensors monitor tank temperature (-28°C), pressure (20 bar), and GPS route telemetry in transit.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5EAEF] text-[11px] font-semibold text-[#5D87FF]">
                  Telemetry Tracking →
                </div>
              </div>
            </StaggerItem>

            {/* Step 4 */}
            <StaggerItem>
              <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-4 relative h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-xl bg-[#E8F9F5] text-[#13DEB9] font-bold flex items-center justify-center text-sm border border-[#13DEB9]/20">
                      04
                    </span>
                    <span className="text-[10px] font-bold text-[#13DEB9] uppercase tracking-wider">VERIFICATION</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2A3547]">Settlement & Audit</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    ISO 14064 compliance proof logs automatically generate upon verified off-take delivery confirmation.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5EAEF] text-[11px] font-semibold text-[#13DEB9]">
                  Audit Compliance →
                </div>
              </div>
            </StaggerItem>

          </StaggerContainer>
        </section>


        {/* 4. FEATURE SHOWCASE WITH REAL INDUSTRIAL IMAGES */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5EAEF] pb-6">
            <div>
              <span className="text-xs font-bold text-[#5D87FF] uppercase tracking-wider">Core Capabilities</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2A3547] mt-1">
                Built for High-Volume Industrial Operations
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/marketplace')}
                className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Browse CO₂ Listings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature Card 1 */}
            <FadeUp delay={0.1}>
              <div className="bg-white border border-[#E5EAEF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={INDUSTRIAL_IMAGES.capturePipelines}
                    alt="Carbon Capture Pipelines"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#5D87FF]">
                      01. Supply Network
                    </span>
                    <span className="text-xs font-mono font-medium text-white/90">Purity Matrix: 98% - 99.9%</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#2A3547]">Certified Industrial CO₂ Supply Streams</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Access verified flue gas and post-combustion CO₂ streams from cement kilns, bio-energy plants, and chemical refining complexes across regional industrial hubs.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs text-[#5D87FF] font-semibold">
                    <Link to="/marketplace" className="inline-flex items-center gap-1 hover:underline">
                      Inspect Available Streams <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Feature Card 2 */}
            <FadeUp delay={0.2}>
              <div className="bg-white border border-[#E5EAEF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={INDUSTRIAL_IMAGES.qualityLab}
                    alt="Quality Testing Laboratory"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#13DEB9]">
                      02. Quality & Assays
                    </span>
                    <span className="text-xs font-mono font-medium text-white/90">Gas Chromatography</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#2A3547]">Deterministic Vector Compatibility Engine</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Algorithms compare required feed purity against supply streams, accounting for moisture content, trace impurities (SOx/NOx), freight distance, and volumetric MOQs.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs text-[#5D87FF] font-semibold">
                    <Link to="/how-it-works" className="inline-flex items-center gap-1 hover:underline">
                      Learn Match Engine Logic <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Feature Card 3 */}
            <FadeUp delay={0.3}>
              <div className="bg-white border border-[#E5EAEF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={INDUSTRIAL_IMAGES.isoTanker}
                    alt="Cryogenic Transport Tanker"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#5D87FF]">
                      03. IoT Logistics
                    </span>
                    <span className="text-xs font-mono font-medium text-white/90">ISO Tank Telematics</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#2A3547]">Cryogenic Telematics & Route Optimization</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Track liquid and gaseous CO₂ freight in real-time. Automated sensor feeds measure container pressure, temperature stability, and delivery ETA.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs text-[#5D87FF] font-semibold">
                    <Link to="/dashboard" className="inline-flex items-center gap-1 hover:underline">
                      View Logistics Telematics <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Feature Card 4 */}
            <FadeUp delay={0.4}>
              <div className="bg-white border border-[#E5EAEF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={INDUSTRIAL_IMAGES.controlRoom}
                    alt="Control Room Verification"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#13DEB9]">
                      04. Compliance
                    </span>
                    <span className="text-xs font-mono font-medium text-white/90">ISO 14064 Audit Trail</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#2A3547]">Cryptographic Verification & Audit Vault</h3>
                  <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                    Immutable custody handoff logs provide third-party verified evidence for carbon accounting audits, carbon tax offsets, and ESG reporting.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs text-[#13DEB9] font-semibold">
                    <Link to="/dashboard/organization/verification" className="inline-flex items-center gap-1 hover:underline">
                      Explore Verification Vault <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>

          </div>
        </section>


        {/* 5. EMITTERS VS UTILIZERS TABBED COMPARISON */}
        <section className="bg-white border border-[#E5EAEF] rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-6">
            <div>
              <span className="text-xs font-bold text-[#5D87FF] uppercase tracking-wider">Designed for Both Sides of the Market</span>
              <h2 className="text-2xl font-bold text-[#2A3547] mt-1">Value Creation across the Circular Value Chain</h2>
            </div>

            <div className="flex bg-[#F6F9FC] p-1 rounded-xl border border-[#E5EAEF] shrink-0">
              <button
                onClick={() => setActiveTab('emitters')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'emitters'
                    ? 'bg-[#5D87FF] text-white shadow-xs'
                    : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                For Industrial Emitters
              </button>
              <button
                onClick={() => setActiveTab('utilizers')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'utilizers'
                    ? 'bg-[#5D87FF] text-white shadow-xs'
                    : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                For Industrial Off-takers
              </button>
            </div>
          </div>

          {activeTab === 'emitters' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3">
                <div className="size-10 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2A3547]">Monetize Flue Gas Streams</h4>
                <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                  Turn captured CO₂ liability into direct commercial revenue by matching excess output with local off-takers.
                </p>
              </div>

              <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3">
                <div className="size-10 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2A3547]">Reduce Carbon Liability</h4>
                <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                  Generate certified, audited proof of utilization for carbon tax reduction and regulatory compliance.
                </p>
              </div>

              <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3">
                <div className="size-10 rounded-lg bg-[#E8F9F5] text-[#13DEB9] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2A3547]">Automated Off-take Logistics</h4>
                <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                  Seamlessly schedule cryogenic ISO tanker dispatch and pipeline connection handoffs without operational downtime.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3">
                <div className="size-10 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2A3547]">Guaranteed Feedstock Supply</h4>
                <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                  Secure long-term contracts and spot market orders for high-purity CO₂ for concrete curing, carbonates, and e-fuels.
                </p>
              </div>

              <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3">
                <div className="size-10 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2A3547]">Optimized Delivered Pricing</h4>
                <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                  Algorithmic transit routing lowers delivered cost per tonne compared to traditional merchant gas suppliers.
                </p>
              </div>

              <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3">
                <div className="size-10 rounded-lg bg-[#E8F9F5] text-[#13DEB9] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2A3547]">Certified Gas Chromatography</h4>
                <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                  Every batch comes with digitally signed assay certificates verifying purity levels up to 99.99%.
                </p>
              </div>
            </div>
          )}
        </section>


        {/* 6. ENTERPRISE SECURITY & COMPLIANCE BANNER */}
        <section className="bg-gradient-to-r from-[#2A3547] to-[#1E2735] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5D87FF]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#49BEFF] text-xs font-bold uppercase tracking-wider border border-white/10">
                <Lock className="w-3.5 h-3.5" /> Enterprise Trust Infrastructure
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Cryptographic Security & ISO Audit Compliance
              </h2>
              <p className="text-xs sm:text-sm text-[#949C96] leading-relaxed max-w-xl">
                CarbonLoop enforces end-to-end encryption, multi-tenant role permissions, automated reviewer verification workflows, and tamper-evident audit logs.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-[#13DEB9]">
                  <CheckCircle2 className="w-4 h-4" /> ISO 14064 Carbon Accounting
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#13DEB9]">
                  <CheckCircle2 className="w-4 h-4" /> Real-Time Telematics Protocol
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#13DEB9]">
                  <CheckCircle2 className="w-4 h-4" /> TLS 1.3 / AES-256 Storage
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-6 py-3.5 h-12 rounded-xl transition-all shadow-md cursor-pointer w-full sm:w-auto"
              >
                Access Verification Console
              </Button>
            </div>
          </div>
        </section>


        {/* 7. FINAL CALL TO ACTION */}
        <section className="text-center space-y-6 pt-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2A3547]">
            Ready to Connect Your Industrial CO₂ Operations?
          </h2>
          <p className="text-sm text-[#5A6A85] font-medium leading-relaxed">
            Join leading cement producers, chemical refineries, and utilization facilities trading verified carbon on the CarbonLoop Exchange.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate('/register')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-sm px-8 py-3.5 h-13 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="border-[#E5EAEF] bg-white hover:bg-[#F6F9FC] text-[#2A3547] font-semibold text-sm px-7 py-3.5 h-13 rounded-xl transition-all w-full sm:w-auto"
            >
              Explore Public Marketplace
            </Button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5EAEF] bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#5A6A85] mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-[#5D87FF] text-white flex items-center justify-center font-bold text-sm rounded-lg">
                C⟳
              </div>
              <span className="font-bold text-base text-[#2A3547]">CarbonLoop</span>
            </div>
            <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
              The premier B2B circular carbon infrastructure network connecting emitters and off-takers.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#2A3547] text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/marketplace" className="hover:text-[#5D87FF]">CO₂ Marketplace</Link></li>
              <li><Link to="/requirements" className="hover:text-[#5D87FF]">Demand Network</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#5D87FF]">Match Engine</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#5D87FF]">Console</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#2A3547] text-xs uppercase tracking-wider mb-3">Solutions</h4>
            <ul className="space-y-2 font-medium">
              <li><span className="hover:text-[#5D87FF] cursor-pointer">For Cement & Steel</span></li>
              <li><span className="hover:text-[#5D87FF] cursor-pointer">For Chemical Plants</span></li>
              <li><span className="hover:text-[#5D87FF] cursor-pointer">Green Concrete Curing</span></li>
              <li><span className="hover:text-[#5D87FF] cursor-pointer">Cryogenic Logistics</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#2A3547] text-xs uppercase tracking-wider mb-3">Compliance</h4>
            <ul className="space-y-2 font-medium">
              <li><span className="hover:text-[#5D87FF] cursor-pointer">ISO 14064 Standard</span></li>
              <li><span className="hover:text-[#5D87FF] cursor-pointer">GC Chromatography</span></li>
              <li><span className="hover:text-[#5D87FF] cursor-pointer">Audit Ledger Vault</span></li>
              <li><Link to="/admin/verification" className="hover:text-[#5D87FF]">Admin Governance</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#E5EAEF] flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <span>© {new Date().getFullYear()} CarbonLoop Industrial Network Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#5D87FF] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#5D87FF] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#5D87FF] cursor-pointer">Security Spec</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

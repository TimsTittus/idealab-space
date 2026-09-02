"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Lightbulb,
  Wrench,
  Zap,
  Calendar,
  Layers,
  Cpu,
  Compass,
  ArrowRight,
  CheckCircle2,
  Users,
  ShieldCheck,
  Award,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface EquipmentData {
  id: string;
  name: string;
  category: string;
  description: string;
  is_available: boolean;
  price?: number | string;
  image_url?: string;
}

const getEquipmentImage = (name?: string, category?: string, imageUrl?: string) => {
  if (imageUrl && imageUrl.trim().length > 0) {
    let img = imageUrl.trim();
    if (!img.startsWith("http") && !img.startsWith("/") && !img.startsWith("data:")) {
      img = `/equipments/${img}`;
    }
    return img;
  }
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (n.includes("laser") || c.includes("laser") || n.includes("cutting")) return "/equipments/laser_cutter.png";
  if (n.includes("cnc") || c.includes("cnc") || n.includes("router") || n.includes("milling") || c.includes("subtractive")) return "/equipments/cnc_router.png";
  if (n.includes("soldering") || n.includes("hakko") || n.includes("station") || n.includes("rework")) return "/equipments/soldering_station.png";
  if (n.includes("oscilloscope") || n.includes("rigol") || n.includes("signal") || n.includes("scope") || n.includes("analyzer")) return "/equipments/oscilloscope.png";
  if (n.includes("pcb") || n.includes("circuit") || c.includes("embedded") || n.includes("arduino") || n.includes("board")) return "/equipments/pcb_printer.png";
  if (c.includes("electronics") || c.includes("iot")) return "/equipments/oscilloscope.png";
  return "/equipments/3d_printer.png";
};

interface EventData {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_time: string;
}

interface StatsData {
  activeMakers: number;
  equipmentTotal: number;
  eventsTotal: number;
  profilesTotal: number;
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState<EquipmentData[]>([]);
  const [eventsList, setEventsList] = useState<EventData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    activeMakers: 0,
    equipmentTotal: 0,
    eventsTotal: 0,
    profilesTotal: 0,
  });
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchRealData() {
      try {
        const supabase = createClient();

        const [eqRes, evRes, checkinRes, profilesRes] = await Promise.all([
          supabase.from("equipment").select("*").order("created_at", { ascending: false }),
          supabase.from("events").select("*").order("start_time", { ascending: true }),
          supabase.from("space_checkins").select("id", { count: "exact" }).eq("is_active", true),
          supabase.from("user_profiles").select("id", { count: "exact" }),
        ]);

        if (eqRes.data) {
          const formatted: EquipmentData[] = eqRes.data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category || "General",
            description: item.description || "",
            is_available: item.is_available ?? item.isAvailable ?? true,
            price: item.price,
            image_url: getEquipmentImage(item.name, item.category, item.image_url || item.imageUrl),
          }));
          setEquipmentList(formatted);
        }

        if (evRes.data) {
          const formattedEvents: EventData[] = evRes.data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            event_type: item.event_type || item.eventType || "Workshop",
            location: item.location || "Choondacherry Campus",
            start_time: item.start_time || item.startTime || new Date().toISOString(),
          }));
          setEventsList(formattedEvents);
        }

        setStats({
          activeMakers: checkinRes.count ?? (checkinRes.data ? checkinRes.data.length : 0),
          equipmentTotal: eqRes.data ? eqRes.data.length : 0,
          eventsTotal: evRes.data ? evRes.data.length : 0,
          profilesTotal: profilesRes.count ?? (profilesRes.data ? profilesRes.data.length : 0),
        });
      } catch (err) {
        console.error("Error loading real data from Supabase:", err);
      } finally {
        setLoadingEquipment(false);
        setLoadingEvents(false);
      }
    }
    fetchRealData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ─── Sticky Light Header Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/AICTE%20IdeaLab%20SJCET%20Palai%20-%20Logo.webp"
              alt="SJCET AICTE IDEA Lab"
              className="h-12 w-auto shrink-0 object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-950 group-hover:text-amber-600 transition-colors">
                  SJCET AICTE IDEA Lab
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-500 tracking-wide uppercase">
                St. Joseph&apos;s College of Eng. & Tech., Palai
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-extrabold text-slate-700">
            <a href="#about" className="hover:text-amber-600 transition-colors">
              About Lab
            </a>
            <a href="#facilities" className="hover:text-amber-600 transition-colors">
              Facilities
            </a>
            <a href="#equipment" className="hover:text-amber-600 transition-colors">
              Machinery
            </a>
            <a href="#services" className="hover:text-amber-600 transition-colors">
              Services
            </a>
            <a href="#events" className="hover:text-amber-600 transition-colors">
              Workshops
            </a>
            <a href="#impact" className="hover:text-amber-600 transition-colors">
              Impact
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/portal"
              className="group relative inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black text-amber-400 shadow-md transition-all hover:bg-slate-900 hover:scale-[1.02] active:scale-95"
            >
              <span>Access Student Portal</span>
              <ArrowRight className="h-4 w-4 text-amber-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 transition-all animate-fade-in shadow-xl">
            <nav className="flex flex-col gap-4 text-sm font-bold text-slate-700">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-600 transition-colors py-1"
              >
                About Lab
              </a>
              <a
                href="#facilities"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-600 transition-colors py-1"
              >
                Facilities & Suites
              </a>
              <a
                href="#equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-600 transition-colors py-1"
              >
                Equipment Inventory
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-600 transition-colors py-1"
              >
                Services Offered
              </a>
              <a
                href="#events"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-600 transition-colors py-1"
              >
                Workshops & Bootcamps
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-600 transition-colors py-1"
              >
                Impact & Metrics
              </a>
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                <Link
                  href="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-black text-amber-400 shadow-md"
                >
                  <span>Access Student Portal</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ─── Vibrant Website Yellow Hero Section (KSUM Reference Layout) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFE033] via-[#FFB703] to-[#FB8500] text-slate-950 py-16 lg:py-24 shadow-inner">
        {/* Subtle Dotted Background Matrix Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Bottom Left Concentric Ring Vector Graphics (matching KSUM image reference) */}
        <svg
          className="absolute -bottom-28 -left-28 h-[450px] w-[450px] text-white/35 pointer-events-none"
          viewBox="0 0 300 300"
          fill="none"
        >
          <circle cx="0" cy="300" r="260" stroke="currentColor" strokeWidth="26" />
          <circle cx="0" cy="300" r="200" stroke="currentColor" strokeWidth="22" />
          <circle cx="0" cy="300" r="140" stroke="currentColor" strokeWidth="18" />
          <circle cx="0" cy="300" r="80" stroke="currentColor" strokeWidth="14" />
        </svg>

        {/* Ambient Top Light Glow */}
        <div className="absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-white/25 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left">
              {/* Facility Category Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-slate-950 border border-slate-950/15 mb-4">
                <ShieldCheck className="h-4 w-4 text-slate-950" />
                <span>FACILITY · SJCET AICTE</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl leading-[1.08]">
                SJCET AICTE <br />
                IDEA Lab
              </h1>

              <p className="mt-2 text-base sm:text-lg font-black text-slate-950/90 tracking-wide">
                Innovate · Design · Engineer · Achieve
              </p>

              {/* Description Paragraph (Justified) */}
              <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-950/85 leading-relaxed font-medium text-justify max-w-2xl">
                SJCET AICTE IDEA Lab is a state-supported digital fabrication initiative under St. Joseph&apos;s College of Engineering and Technology, Palai, enabling students, faculty, and innovators to transform ideas into functional prototypes, market-ready solutions, and scalable products through access to rapid prototyping capabilities, knowledge, and mentorship.
              </p>

              {/* Action Pill Buttons (Matching KSUM layout) */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2.5 rounded-full bg-slate-950 px-6 py-3.5 text-xs font-black text-amber-400 shadow-xl transition-all hover:bg-slate-900 active:scale-95"
                >
                  <span>Explore Our Machines & Services</span>
                  <ExternalLink className="h-4 w-4 text-amber-400" />
                </Link>

                <Link
                  href="/space/checkin"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950/30 bg-slate-950/10 backdrop-blur-md px-6 py-3.5 text-xs font-black text-slate-950 transition-all hover:bg-slate-950/20 active:scale-95"
                >
                  <span>Submit Your Work</span>
                </Link>
              </div>
            </div>

            {/* Right Photo Column (Matching KSUM photo frame & dot grid accent) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white/50 shadow-2xl group bg-slate-900">
                <img
                  src="/images/idealab_facility_hero.jpg"
                  alt="SJCET AICTE IDEA Lab Facility"
                  className="w-full h-[300px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block">
                    Main Fabrication Facility
                  </span>
                  <p className="text-sm font-extrabold text-white">
                    SJCET Choondacherry Campus, Palai
                  </p>
                </div>
              </div>

              {/* Dotted Grid Matrix Graphic (Bottom Right Accent from KSUM reference) */}
              <div className="absolute -bottom-6 -right-6 z-10 grid grid-cols-6 gap-2 p-2 pointer-events-none hidden sm:grid">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-950/40" />
                ))}
              </div>
            </div>
          </div>

          {/* Stat Counters Banner (Real Database Metrics) */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-slate-950/20">
            <div className="rounded-2xl border border-slate-950/10 bg-slate-950 p-5 shadow-lg text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-400">
                {stats.equipmentTotal > 0 ? `${stats.equipmentTotal}+` : "6+"}
              </span>
              <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-300">Machinery Count</span>
            </div>
            <div className="rounded-2xl border border-slate-950/10 bg-slate-950 p-5 shadow-lg text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-400">
                {stats.profilesTotal > 0 ? `${stats.profilesTotal}+` : "100+"}
              </span>
              <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-300">Registered Makers</span>
            </div>
            <div className="rounded-2xl border border-slate-950/10 bg-slate-950 p-5 shadow-lg text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-400">
                {stats.eventsTotal > 0 ? `${stats.eventsTotal}+` : "12+"}
              </span>
              <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-300">Bootcamps & Workshops</span>
            </div>
            <div className="rounded-2xl border border-slate-950/10 bg-slate-950 p-5 shadow-lg text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-400">
                {stats.activeMakers}
              </span>
              <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-300">Live Active Makers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About Section ─────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white border-b border-slate-200 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-widest mb-4">
                <Compass className="h-3.5 w-3.5 text-amber-600" />
                <span>About the AICTE Initiative</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                Transforming Engineering Education into Hands-on Fabrication
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal text-justify">
                The AICTE IDEA (Idea Development, Evaluation & Application) Lab scheme encourages students to apply science, technology, engineering, and mathematics (STEM) fundamentals toward hands-on product creation.
              </p>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal text-justify">
                At SJCET Palai, the IDEA Lab serves as an interdisciplinary manufacturing hub where students from all departments access high-end industrial machinery, work on real-world engineering challenges, and convert early-stage ideas into market-tested hardware products.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 text-justify">
                    24x7 Facility Access for certified student makers and faculty researchers
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 text-justify">
                    Interdisciplinary collaboration across Mechanical, Electronics, Computer Science & Civil
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 text-justify">
                    Direct mentorship by trained faculty coordinators and industry experts
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Pillars Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 transition-all hover:bg-white hover:border-amber-400 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black mb-4">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-slate-950">Rapid Prototyping</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  Turn CAD blueprints into solid physical models in hours using industrial FDM and SLA printers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 transition-all hover:bg-white hover:border-amber-400 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black mb-4">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-slate-950">Embedded Electronics</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  Design, etch, populate, and debug custom circuit boards and IoT node electronics.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 transition-all hover:bg-white hover:border-amber-400 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black mb-4">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-slate-950">Subtractive CNC</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  Precision CNC routing and milling for wood, acrylic, aluminum, and composite components.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 transition-all hover:bg-white hover:border-amber-400 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-slate-950">Startup Incubation</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  Bridge student project prototypes with institutional grants and hardware startup accelerators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Facilities & Machine Suites (Light Yellow Gradient with Dot Pattern) ── */}
      <section id="facilities" className="py-20 bg-gradient-to-br from-[#FFFDEB] via-[#FFE875] to-[#FFC72C] border-b border-amber-400/40 relative overflow-hidden shadow-inner">
        {/* Subtle Dot Matrix Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Ambient Corner Light Glow */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-slate-950 uppercase tracking-widest bg-slate-950/10 px-3.5 py-1.5 rounded-full border border-slate-950/10 inline-block mb-3 backdrop-blur-sm">
              State-of-the-Art Infrastructure
            </span>
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
              Specialized Prototyping Laboratories
            </h2>
            <p className="mt-3 text-sm sm:text-base font-medium text-slate-950/85 max-w-2xl mx-auto">
              Explore the dedicated fabrication sections housed inside SJCET AICTE IDEA Lab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-7 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-5 shadow-md">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Additive Manufacturing Lab</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  Features industrial FDM 3D printers and high-precision SLA resin printers for rapid physical visualization of CAD designs.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> High-volume FDM Printers (PLA/PETG/ABS)
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Precision SLA Resin Printers (50 micron resolution)
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> 3D Handheld Optical Scanner
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-7 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-5 shadow-md">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Subtractive & CNC Milling Suite</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  Heavy-duty computer numerical control machinery for automated routing, wood shaping, and metal component milling.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> 3-Axis Wood & Acrylic CNC Router
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Precision Desktop PCB Milling Machine
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Vertical CNC Milling Machine
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-7 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-5 shadow-md">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Laser Cutting & Engraving</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  High-speed CO2 laser cutting system for rapid sheet material cutting, enclosure fabrication, and precise engraving.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> 100W CO2 Laser Cutter & Engraver
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Support for Acrylic, MDF, Plywood, Leather
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Automated Air Assist & Exhaust Filtration
                </li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-7 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-5 shadow-md">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Embedded Systems & IoT Testing</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  Fully equipped electronics lab for circuit assembly, signal analysis, microcontroller programming, and wireless node testing.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> 100MHz Digital Storage Oscilloscopes
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Temperature-Controlled Soldering Stations
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Arbitrary Function Signal Generators
                </li>
              </ul>
            </div>

            {/* Card 5 */}
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-7 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-5 shadow-md">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">CAD/CAM Design Workstations</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  High-performance graphics workstations pre-installed with licensed 3D modeling, CAM simulation, and PCB layout software.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> 3D CAD Modeling & Finite Element Analysis
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> G-Code Toolpath CAM Simulation Software
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Multi-layer PCB Layout Design Suites
                </li>
              </ul>
            </div>

            {/* Card 6 */}
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-7 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-5 shadow-md">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Wood & Metal Workshop</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  Traditional power tools, bench saws, drills, and surface finishing gear for structural mechanical fabrication.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Vertical Band Saw & Bench Grinders
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Variable-speed Heavy Duty Drill Press
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" /> Hand-held Cordless Tools & Safety Equipment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Equipment Inventory Showcase ──────────────────────────── */}
      <section id="equipment" className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Lab Inventory
              </span>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
                Featured Machines & Equipment
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl text-justify">
                Inspect available machinery at SJCET AICTE IDEA Lab. Student makers can reserve equipment slots via the portal.
              </p>
            </div>
            <Link
              href="/equipment"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
            >
              <span>View Full Inventory in Portal</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingEquipment ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-between animate-pulse"
                >
                  <div>
                    <div className="h-36 w-full bg-slate-200 rounded-2xl mb-4" />
                    <div className="h-4 w-20 bg-amber-200 rounded mb-2" />
                    <div className="h-5 w-3/4 bg-slate-300 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-slate-200 rounded" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-amber-200 rounded" />
                  </div>
                </div>
              ))
            ) : equipmentList.length > 0 ? (
              equipmentList.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 flex flex-col justify-between hover:bg-white hover:border-amber-400 hover:shadow-xl transition-all group"
                >
                  <div>
                    <div className="h-36 w-full flex items-center justify-center p-3 bg-white rounded-2xl border border-slate-200/60 mb-4 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={getEquipmentImage(item.name, item.category, item.image_url)}
                        alt={item.name}
                        className="h-full w-full object-contain drop-shadow-xs"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = getEquipmentImage(item.name, item.category, "");
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                      />
                    </div>
                    <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-2">
                      {item.category}
                    </span>
                    <h4 className="text-base font-black text-slate-950 leading-snug">
                      {item.name}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-600 text-justify line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    {item.is_available ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> Reserved / In Use
                      </span>
                    )}
                    <Link
                      href={item.id ? `/equipment/${item.id}` : "/equipment"}
                      className="text-xs font-black text-amber-600 hover:underline"
                    >
                      Book Slot →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-sm font-extrabold text-slate-700">No machinery registered in database currently.</p>
                <Link href="/equipment" className="mt-2 inline-block text-xs font-black text-amber-600 hover:underline">
                  View Portal Inventory →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Services & Ecosystem Section (Light Yellow Gradient with Dot Pattern) ── */}
      <section id="services" className="py-20 bg-gradient-to-br from-[#FFFDEB] via-[#FFE875] to-[#FFC72C] border-b border-amber-400/40 relative overflow-hidden shadow-inner">
        {/* Subtle Dot Matrix Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Ambient Corner Light Glow */}
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/30 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-slate-950 uppercase tracking-widest bg-slate-950/10 px-3.5 py-1.5 rounded-full border border-slate-950/10 inline-block mb-3 backdrop-blur-sm">
              END-TO-END SUPPORT
            </span>
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
              Services Offered to Innovators
            </h2>
            <p className="mt-3 text-sm sm:text-base font-medium text-slate-950/85 max-w-2xl mx-auto">
              Beyond machinery, SJCET AICTE IDEA Lab provides comprehensive guidance from ideation to final prototype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-4 shadow-md">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-950">Prototyping Guidance</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                Expert assistance on choosing optimal materials, CAD optimization for 3D printing, and G-code generation.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-4 shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-950">Safety Certification</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                Hands-on safety bootcamps ensuring every maker operates high-power machinery securely and efficiently.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-4 shadow-md">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-950">Maker Bootcamps</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                Regular weekend bootcamps in 3D Modeling, PCB Design, Robotics, CNC Router operation, and IoT nodes.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-950/10 bg-white/95 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 font-black mb-4 shadow-md">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-950">Technical Mentorship</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                One-on-one sessions with senior faculty mentors and industry specialists to solve complex technical bugs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Events & Workshops Section ─────────────────────────────── */}
      <section id="events" className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Hands-on Training
              </span>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
                Upcoming Bootcamps & Workshops
              </h2>
              <p className="mt-2 text-sm text-slate-600 text-justify">
                Join upcoming maker sessions organized by SJCET AICTE IDEA Lab.
              </p>
            </div>
            <Link
              href="/events"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-black text-amber-600 hover:text-amber-700 transition-colors shrink-0"
            >
              <span>View All Events in Portal</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingEvents ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between animate-pulse"
                >
                  <div>
                    <div className="h-4 w-24 bg-amber-200 rounded mb-3" />
                    <div className="h-6 w-3/4 bg-slate-300 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-slate-200 rounded" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-amber-200 rounded" />
                  </div>
                </div>
              ))
            ) : eventsList.length > 0 ? (
              eventsList.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 flex flex-col justify-between hover:bg-white hover:border-amber-400 hover:shadow-xl transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-3">
                      <span className="truncate pr-2">{item.location}</span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-900 shrink-0">
                        {item.event_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-950 leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(item.start_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Link
                      href="/events"
                      className="text-xs font-black text-amber-600 hover:underline"
                    >
                      Register in Portal →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
                <p className="text-sm font-extrabold text-slate-700">No upcoming workshops scheduled at this moment.</p>
                <Link href="/events" className="mt-2 inline-block text-xs font-black text-amber-600 hover:underline">
                  Explore Events Calendar in Portal →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Impact & Key Achievements Section ─────────────────────── */}
      <section id="impact" className="py-20 bg-slate-50/80 pb-36 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-200 inline-block mb-3">
              Key Achievements
            </span>
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
              Driving Hardware Innovation in Kerala
            </h2>
            <p className="mt-3 text-sm text-slate-600 text-justify sm:text-center">
              SJCET AICTE IDEA Lab provides young engineering minds with instant access to tools, knowledge, and collaborative spaces.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xs">
              <span className="text-3xl font-black text-amber-500">
                {stats.profilesTotal > 0 ? `${stats.profilesTotal}+` : "100+"}
              </span>
              <span className="block text-xs font-extrabold text-slate-700 mt-1 uppercase tracking-wider">Registered Makers</span>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xs">
              <span className="text-3xl font-black text-amber-500">
                {stats.equipmentTotal > 0 ? `${stats.equipmentTotal}+` : "6+"}
              </span>
              <span className="block text-xs font-extrabold text-slate-700 mt-1 uppercase tracking-wider">Machinery Units</span>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xs">
              <span className="text-3xl font-black text-amber-500">
                {stats.eventsTotal > 0 ? `${stats.eventsTotal}+` : "12+"}
              </span>
              <span className="block text-xs font-extrabold text-slate-700 mt-1 uppercase tracking-wider">Bootcamps & Workshops</span>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xs">
              <span className="text-3xl font-black text-amber-500">
                {stats.activeMakers}
              </span>
              <span className="block text-xs font-extrabold text-slate-700 mt-1 uppercase tracking-wider">Live Active Makers</span>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="relative z-10 font-sans">
        <div className="bg-[#FFB703] text-slate-950 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.16)_1px,transparent_1px)] [background-size:44px_44px] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl z-10 flex flex-col items-center justify-center text-center">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 my-4">
              <div className="-rotate-6 bg-[#2EC4B6] border-2 border-slate-950 text-slate-950 font-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] text-xs uppercase tracking-wider hidden sm:flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="h-4 w-4 text-slate-950" />
                <span>RESERVE YOUR SLOT</span>
              </div>

              <Link
                href="/portal"
                className="group relative inline-flex items-center justify-center rounded-full border-4 border-slate-950 bg-slate-950 px-8 sm:px-14 py-4 sm:py-5 text-xl sm:text-3xl font-black text-amber-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
              >
                <span className="underline underline-offset-4 decoration-amber-400/40">Access Student Portal</span>
              </Link>

              <div className="rotate-6 bg-orange-600 border-2 border-slate-950 text-white font-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] text-xs uppercase tracking-wider hidden sm:block shrink-0">
                <span>FREE ACCESS!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#FFB703] leading-none -mt-1">
          <svg className="w-full h-8 sm:h-12 text-[#FFFBE6] fill-current" viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path d="M0,0 C30,40 60,40 90,0 C120,40 150,40 180,0 C210,40 240,40 270,0 C300,40 330,40 360,0 C390,40 420,40 450,0 C480,40 510,40 540,0 C570,40 600,40 630,0 C660,40 690,40 720,0 C750,40 780,40 810,0 C840,40 870,40 900,0 C930,40 960,40 990,0 C1020,40 1050,40 1080,0 C1110,40 1140,40 1170,0 C1185,20 1200,20 1200,0 L1200,60 L0,60 Z" />
          </svg>
        </div>

        <div className="bg-[#FFFBE6] text-slate-950 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className="text-slate-950 font-black text-sm sm:text-base leading-snug max-w-2xl ml-auto text-justify sm:text-right">
                From 3D Printing At Additive Suite To Precision CNC Milling, There&apos;s A Little Something For Every Maker.
              </p>
            </div>

            {/* Main Footer Content Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-950/15 items-start">
              {/* Brand Title Column */}
              <div className="col-span-2 md:col-span-2">
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-950 leading-none lowercase">
                  sjcet idealab
                </h2>
                <p className="mt-3 text-xs font-bold text-slate-800 max-w-md text-justify">
                  St. Joseph&apos;s College of Engineering and Technology, Choondacherry P.O., Palai, Kottayam District, Kerala - 686579.
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-600 text-justify">
                  An Initiative Sponsored by AICTE (All India Council for Technical Education), New Delhi.
                </p>
              </div>

              {/* Quick Links Column */}
              <div className="col-span-1 md:col-span-1">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-4">Quick Links</h4>
                <ul className="space-y-2 text-xs font-bold text-slate-700">
                  <li>
                    <Link href="/portal" className="hover:text-amber-600 transition-colors">
                      Student Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/equipment" className="hover:text-amber-600 transition-colors">
                      Equipment Inventory
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className="hover:text-amber-600 transition-colors">
                      Events & Bootcamps
                    </Link>
                  </li>
                  <li>
                    <Link href="/space" className="hover:text-amber-600 transition-colors">
                      Space Live Status
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-amber-600 transition-colors">
                      Google Sign In
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Lab Contact Column */}
              <div className="col-span-1 md:col-span-1">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-4">Lab Contact</h4>
                <ul className="space-y-2 text-xs font-bold text-slate-700">
                  <li className="text-slate-950 font-extrabold">SJCET Palai Campus</li>
                  <li className="break-words">Email: idealab@sjcetpalai.ac.in</li>
                  <li>Palai, Kottayam, Kerala</li>
                  <li>Pin Code: 686579</li>
                </ul>
              </div>
            </div>

            {/* Bottom Copyright & Portal Access Row */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-slate-600">
              <p>© 2026 SJCET AICTE IDEA Lab. All rights reserved.</p>
              <p className="flex items-center gap-4">
                <Link href="/portal" className="hover:text-slate-950 transition-colors">
                  Portal Access
                </Link>
                <span>·</span>
                <Link href="/admin" className="hover:text-slate-950 transition-colors">
                  Admin Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
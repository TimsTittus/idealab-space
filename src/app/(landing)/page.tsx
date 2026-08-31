"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ─── Sticky Light Header Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <Lightbulb className="h-6 w-6 text-slate-950 fill-slate-950/20" />
            </div>
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

      {/* ─── Light Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-orange-50/30 to-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100">
        {/* Subtle Decorative Ambient Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-orange-300/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* AICTE Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-100/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-xs mb-6 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>AICTE Sponsored Center of Excellence</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl leading-[1.1]">
              SJCET AICTE <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">IDEA Lab</span>
            </h1>

            <p className="mt-4 text-lg font-black text-slate-800 sm:text-xl tracking-wide">
              Innovate · Design · Engineer · Achieve
            </p>

            {/* Description (Justified) */}
            <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto text-justify">
              A premier digital fabrication and prototyping center at St. Joseph&apos;s College of Engineering and Technology, Palai. Empowering students, faculty, and innovators to convert ideas into physical, market-ready prototypes with industrial 3D printers, CNC routers, laser cutters, and electronics suites.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/portal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-slate-950 px-8 py-4 text-sm font-black text-amber-400 shadow-xl shadow-slate-950/15 transition-all hover:bg-slate-900 hover:scale-105 active:scale-95"
              >
                <span>Enter Student Access Portal</span>
                <ArrowRight className="h-5 w-5 text-amber-400" />
              </Link>
              <a
                href="#facilities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-bold text-slate-800 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-95"
              >
                <span>Explore Facilities & Machinery</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </a>
            </div>

            {/* Stat Counters Banner */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-200">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm text-center">
                <span className="text-3xl sm:text-4xl font-black text-amber-600">10+</span>
                <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">Machine Suites</span>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm text-center">
                <span className="text-3xl sm:text-4xl font-black text-amber-600">500+</span>
                <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">Prototypes Built</span>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm text-center">
                <span className="text-3xl sm:text-4xl font-black text-amber-600">1,200+</span>
                <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">Makers Trained</span>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm text-center">
                <span className="text-3xl sm:text-4xl font-black text-amber-600">24/7</span>
                <span className="block mt-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">Innovation Access</span>
              </div>
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

      {/* ─── Facilities & Machine Suites ─────────────────────────── */}
      <section id="facilities" className="py-20 bg-slate-50/80 border-b border-slate-200 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              State-of-the-Art Infrastructure
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
              Specialized Prototyping Laboratories
            </h2>
            <p className="mt-3 text-sm text-slate-600 text-justify">
              Explore the dedicated fabrication sections housed inside SJCET AICTE IDEA Lab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black mb-5 shadow-sm">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Additive Manufacturing Lab</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Features industrial FDM 3D printers and high-precision SLA resin printers for rapid physical visualization of CAD designs.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> High-volume FDM Printers (PLA/PETG/ABS)
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Precision SLA Resin Printers (50 micron resolution)
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> 3D Handheld Optical Scanner
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black mb-5 shadow-sm">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Subtractive & CNC Milling Suite</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Heavy-duty computer numerical control machinery for automated routing, wood shaping, and metal component milling.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> 3-Axis Wood & Acrylic CNC Router
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Precision Desktop PCB Milling Machine
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Vertical CNC Milling Machine
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black mb-5 shadow-sm">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Laser Cutting & Engraving</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  High-speed CO2 laser cutting system for rapid sheet material cutting, enclosure fabrication, and precise engraving.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> 100W CO2 Laser Cutter & Engraver
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Support for Acrylic, MDF, Plywood, Leather
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Automated Air Assist & Exhaust Filtration
                </li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black mb-5 shadow-sm">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Embedded Systems & IoT Testing</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Fully equipped electronics lab for circuit assembly, signal analysis, microcontroller programming, and wireless node testing.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> 100MHz Digital Storage Oscilloscopes
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Temperature-Controlled Soldering Stations
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Arbitrary Function Signal Generators
                </li>
              </ul>
            </div>

            {/* Card 5 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black mb-5 shadow-sm">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">CAD/CAM Design Workstations</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  High-performance graphics workstations pre-installed with licensed 3D modeling, CAM simulation, and PCB layout software.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> 3D CAD Modeling & Finite Element Analysis
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> G-Code Toolpath CAM Simulation Software
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Multi-layer PCB Layout Design Suites
                </li>
              </ul>
            </div>

            {/* Card 6 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black mb-5 shadow-sm">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">Wood & Metal Workshop</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Traditional power tools, bench saws, drills, and surface finishing gear for structural mechanical fabrication.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Vertical Band Saw & Bench Grinders
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Variable-speed Heavy Duty Drill Press
                </li>
                <li className="flex items-center gap-2 text-justify">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Hand-held Cordless Tools & Safety Equipment
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 flex flex-col justify-between hover:bg-white hover:border-amber-400 hover:shadow-md transition-all">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-3">
                  Additive
                </span>
                <h4 className="text-base font-black text-slate-950">Industrial FDM 3D Printer</h4>
                <p className="mt-1 text-xs text-slate-600 text-justify">
                  Large build volume (300 x 300 x 400 mm), dual extruder, PLA/PETG/ABS filament support.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                </span>
                <Link
                  href="/equipment"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Book Slot →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 flex flex-col justify-between hover:bg-white hover:border-amber-400 hover:shadow-md transition-all">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-3">
                  Subtractive
                </span>
                <h4 className="text-base font-black text-slate-950">Heavy-Duty CNC Wood Router</h4>
                <p className="mt-1 text-xs text-slate-600 text-justify">
                  3-Axis CNC cutting system for sheet plywood, MDF, hard wood, and acrylic milling.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                </span>
                <Link
                  href="/equipment"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Book Slot →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 flex flex-col justify-between hover:bg-white hover:border-amber-400 hover:shadow-md transition-all">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-3">
                  Laser
                </span>
                <h4 className="text-base font-black text-slate-950">100W CO2 Laser Cutter</h4>
                <p className="mt-1 text-xs text-slate-600 text-justify">
                  High-speed cutting and precision vector engraving for acrylic, wood, and paperboard.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                </span>
                <Link
                  href="/equipment"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Book Slot →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 flex flex-col justify-between hover:bg-white hover:border-amber-400 hover:shadow-md transition-all">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-3">
                  Electronics
                </span>
                <h4 className="text-base font-black text-slate-950">Digital Storage Oscilloscope</h4>
                <p className="mt-1 text-xs text-slate-600 text-justify">
                  4-Channel 100MHz digital storage oscilloscope with logic analyzer and protocol decoding.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                </span>
                <Link
                  href="/equipment"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Book Slot →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services & Ecosystem Section ──────────────────────────── */}
      <section id="services" className="py-20 bg-slate-50/80 border-b border-slate-200 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              End-to-End Support
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
              Services Offered to Innovators
            </h2>
            <p className="mt-3 text-sm text-slate-600 text-justify">
              Beyond machinery, SJCET AICTE IDEA Lab provides comprehensive guidance from ideation to final prototype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black mb-4">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-950">Prototyping Guidance</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                Expert assistance on choosing optimal materials, CAD optimization for 3D printing, and G-code generation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-950">Safety Certification</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                Hands-on safety bootcamps ensuring every maker operates high-power machinery securely and efficiently.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black mb-4">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-950">Maker Bootcamps</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                Regular weekend bootcamps in 3D Modeling, PCB Design, Robotics, CNC Router operation, and IoT nodes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-950">Technical Mentorship</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
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
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 flex flex-col justify-between hover:bg-white hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-3">
                  <span>3D Printing Bootcamp</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-900">
                    Hands-on
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-950">Mastering FDM & SLA 3D Printers</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  Learn slicing parameters, filament selection, resin curing techniques, and troubleshooting 3D print failures.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Choondacherry Campus</span>
                <Link
                  href="/events"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Register in Portal →
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 flex flex-col justify-between hover:bg-white hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-3">
                  <span>Electronics Workshop</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-900">
                    Circuit Design
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-950">PCB Layout & SMD Soldering</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  Schematic capture, multi-layer PCB routing, desktop milling, and fine-pitch SMD component soldering.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Electronics Suite</span>
                <Link
                  href="/events"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Register in Portal →
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 flex flex-col justify-between hover:bg-white hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-3">
                  <span>CNC Masterclass</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-900">
                    Fabrication
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-950">CNC Router Programming & Safety</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed text-justify">
                  G-code generation, feeds and speeds optimization, material clamping, and safe CNC router operation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">CNC Workshop</span>
                <Link
                  href="/events"
                  className="text-xs font-black text-amber-600 hover:underline"
                >
                  Register in Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Impact & Student Portal CTA Hero Card ─────────────────── */}
      <section id="impact" className="py-20 relative bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Key Achievements
                </span>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl tracking-tight">
                  Driving Hardware Innovation in Kerala
                </h2>
                <p className="mt-4 text-sm text-slate-300 leading-relaxed text-justify">
                  SJCET AICTE IDEA Lab provides young engineering minds with instant access to tools, knowledge, and collaborative spaces.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-2xl font-black text-amber-400">100%</span>
                    <span className="block text-xs font-bold text-slate-400 mt-1">Student Access</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-2xl font-black text-amber-400">50+</span>
                    <span className="block text-xs font-bold text-slate-400 mt-1">Patents & Projects</span>
                  </div>
                </div>
              </div>

              {/* Student Access Portal Banner Card */}
              <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-8 text-slate-950 shadow-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/10 px-3 py-1 text-[11px] font-black uppercase text-slate-950 mb-3 border border-slate-950/10">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Student & Faculty Portal</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">
                  Ready to Start Building?
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-bold text-slate-950/80 leading-relaxed text-justify">
                  Access the live IDEA Lab Portal to check real-time space occupancy, reserve equipment slots, view upcoming workshops, and update your maker profile.
                </p>
                <Link
                  href="/portal"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-black text-amber-400 shadow-xl transition-all hover:bg-slate-900 active:scale-95"
                >
                  <span>Launch Student Portal Now</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer (Dark Grounding Footer) ────────────────────────── */}
      <footer id="contact" className="bg-slate-950 border-t border-slate-900 py-16 text-slate-400 text-xs font-medium">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <span className="text-base font-black text-white">SJCET AICTE IDEA Lab</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md text-justify">
                St. Joseph&apos;s College of Engineering and Technology (SJCET), Choondacherry P.O., Palai, Kottayam District, Kerala - 686579.
              </p>
              <p className="mt-3 text-xs text-slate-500 font-semibold text-justify">
                An Initiative Sponsored by AICTE (All India Council for Technical Education), New Delhi.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/portal" className="hover:text-amber-400 transition-colors">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className="hover:text-amber-400 transition-colors">
                    Equipment Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-amber-400 transition-colors">
                    Events & Bootcamps
                  </Link>
                </li>
                <li>
                  <Link href="/space" className="hover:text-amber-400 transition-colors">
                    Space Live Status
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-amber-400 transition-colors">
                    Google Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Lab Contact</h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-300 font-semibold">SJCET Palai Campus</li>
                <li>Email: idealab@sjcetpalai.ac.in</li>
                <li>Palai, Kottayam, Kerala</li>
                <li>Pin Code: 686579</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 SJCET AICTE IDEA Lab. All rights reserved.</p>
            <p className="flex items-center gap-4">
              <Link href="/portal" className="hover:text-slate-300">
                Portal Access
              </Link>
              <span>·</span>
              <Link href="/admin" className="hover:text-slate-300">
                Admin Portal
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
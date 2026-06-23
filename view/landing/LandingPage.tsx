
import React, { useState, useEffect, useRef } from 'react';
import {
  Truck, ArrowRight, ChevronDown, Star, Leaf, Users, BarChart2,
  MapPin, Award, Zap, CheckCircle, Package, Shield, Globe,
  Menu, X, Quote as QuoteIcon, TrendingUp, HeartHandshake, Bike
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

// ─── Material Symbols Icon helper (same icon set as Flutter) ─────────────────
function MSIcon({ name, className = '', fill = 1, size = 24 }: {
  name: string; className?: string; fill?: 0 | 1; size?: number;
}) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`, fontSize: size }}
    >
      {name}
    </span>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function CursorFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Prime Cursor Follower (Glowing Spot) */}
      <div 
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-[9999] opacity-60 mix-blend-multiply dark:mix-blend-screen transition-transform duration-700 ease-out blur-[80px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 60%)',
          transform: `translate(${position.x - 250}px, ${position.y - 250}px)`
        }}
      />
      {/* Precise Cursor Ring */}
      <div 
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-orange-500/50 pointer-events-none z-[9999] transition-all duration-300 ease-out hidden lg:block shadow-[0_0_15px_rgba(249,115,22,0.3)] ${isPointer ? 'scale-150 bg-orange-500/20 border-orange-500' : 'scale-100'}`}
        style={{ 
          transform: `translate(${position.x - 16}px, ${position.y - 16}px)`
        }}
      />
    </>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Navbar({ onNavigate }: { onNavigate: (v: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);

    // Intersection Observer for Scroll Spy
    const options = { rootMargin: '-40% 0px -40% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    const sectionIds = ['features', 'impact', 'how', 'gamification', 'faq'];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handler);
      observer.disconnect();
    };
  }, []);

  const links = [
    { label: 'Fitur', href: '#features' },
    { label: 'Dampak', href: '#impact' },
    { label: 'Cara Kerja', href: '#how' },
    { label: 'Gamifikasi', href: '#gamification' },
    { label: 'FAQ', href: '#faq' },
  ];

  const scroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200 shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/assets/logo-alt.svg" alt="Food AI Rescue" className="h-10 w-auto object-contain bg-white rounded-full p-1 shadow-sm" />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {links.map(l => {
            const isActive = activeSection === l.href.replace('#', '');
            return (
              <button key={l.href} onClick={() => scroll(l.href)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-stone-100 text-orange-600 shadow-sm' 
                    : 'text-stone-500 hover:text-orange-600'
                }`}>
                {l.label}
              </button>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => onNavigate('login')}
            className="px-5 py-2.5 rounded-xl border-2 border-stone-200 text-stone-700 font-bold text-sm hover:border-orange-400 hover:text-orange-600 transition-all">
            Masuk
          </button>
          <button onClick={() => onNavigate('register')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all">
            Daftar Gratis →
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => onNavigate('login')}
            className="px-4 py-2 text-stone-700 font-bold text-sm hover:text-orange-600 transition-colors">
            Masuk
          </button>
          <button className="p-2 text-stone-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-stone-200 px-6 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-300">
          {links.map(l => {
            const isActive = activeSection === l.href.replace('#', '');
            return (
              <button key={l.href} onClick={() => scroll(l.href)}
                className={`block w-full text-left py-3 px-4 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-600' 
                    : 'text-stone-700 border-b border-stone-100'
                }`}>
                {l.label}
              </button>
            );
          })}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { onNavigate('login'); setMenuOpen(false); }}
              className="flex-1 py-3 rounded-xl border-2 border-stone-200 font-bold text-sm text-stone-700">Masuk</button>
            <button onClick={() => { onNavigate('register'); setMenuOpen(false); }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-bold text-sm">Daftar Gratis</button>
          </div>
        </div>
      )}
    </nav>
  );
}


function HeroSection({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh-light pt-20">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-orange-100/60 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-100/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left - Text */}
        <div className={`transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-xs font-black uppercase tracking-widest mb-8">
            <Leaf className="w-3.5 h-3.5" /> Platform Penyelamatan Pangan #1
          </div>

          <h1 className="text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-stone-900 mb-6">
            <span className="text-stone-400">STOP</span><br />
            WASTING.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500">
              START SHARING.
            </span>
          </h1>

          <p className="text-lg text-stone-600 font-medium leading-relaxed mb-10 max-w-lg">
            Platform penyelamatan surplus pangan berbasis <strong className="text-orange-600">AI</strong> yang menghubungkan bisnis makanan dengan komunitas. 
            Gratis, mudah, dan berdampak nyata untuk lingkungan.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <button onClick={() => onNavigate('register')}
              className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-black rounded-2xl text-base shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
              Daftar Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onNavigate('login')}
              className="px-8 py-4 border-2 border-stone-200 text-stone-700 font-black rounded-2xl text-base hover:border-orange-400 hover:text-orange-600 hover:-translate-y-1 transition-all duration-300">
              Masuk Akun
            </button>
          </div>

          {/* Social proof pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: 'star', text: 'Dipercaya 1000+ Donatur', color: 'text-yellow-500' },
              { icon: 'public', text: '5+ Ton CO₂ Berkurang', color: 'text-green-600' },
              { icon: 'lunch_dining', text: '300+ Penerima Manfaat', color: 'text-orange-500' },
            ].map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-stone-600 text-xs font-bold shadow-sm">
                <MSIcon name={b.icon} size={14} fill={1} className={b.color} /> {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Right - Visual Card */}
        <div className={`relative transition-all duration-1000 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Main hero image card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-100 border border-orange-100">
            <img
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=900&auto=format&fit=crop"
              alt="Food Rescue"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

            {/* Floating Card: AI Verified */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">AI Verified</p>
                <p className="text-[10px] text-stone-500">Layak Konsumsi ✓</p>
              </div>
            </div>

            {/* Floating Card: Claim */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-orange-100">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Tersedia Sekarang</p>
              <p className="text-2xl font-black text-stone-900">50 Porsi</p>
              <p className="text-xs text-stone-500">Nasi Box Premium · Gratis</p>
            </div>

            {/* Floating badge: CO2 */}
            <div className="absolute bottom-6 left-6 bg-green-600 text-white rounded-2xl p-3 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">CO₂ Diselamatkan</p>
              <p className="text-xl font-black">12.5 kg</p>
            </div>
          </div>

          {/* Decorative dot grid */}
          <div className="absolute -right-8 -top-8 w-32 h-32 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 animate-bounce">
        <span className="text-xs font-bold tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
}


function ProblemSection() {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} className="py-40 bg-mesh-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-orange-500/30">Masalah yang Kami Selesaikan</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight mb-4">
            <span className="text-stone-400">1/3 Makanan di Dunia</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Terbuang Sia-sia.</span>
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto font-medium">Sementara jutaan orang kekurangan akses pangan layak. Ini tidak harus terjadi.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: 'delete_sweep', iconColor: 'text-red-400', color: 'border-red-800 bg-red-900/20',
              title: 'Makanan Surplus Terbuang',
              stat: '931 Juta Ton/Tahun',
              desc: 'Restoran, hotel, dan usaha katering membuang makanan layak konsumsi setiap hari karena tidak ada sistem distribusinya.'
            },
            {
              icon: 'no_food', iconColor: 'text-orange-400', color: 'border-orange-800 bg-orange-900/20',
              title: 'Jutaan Masih Kelaparan',
              stat: '8% Populasi Dunia',
              desc: 'Lebih dari 700 juta orang di dunia tidak memiliki akses ke makanan bergizi yang cukup, termasuk di sekitar kita.'
            },
            {
              icon: 'volunteer_activism', iconColor: 'text-green-400', color: 'border-green-700 bg-green-900/20',
              title: 'Food AI Rescue Menjadi Solusi',
              stat: 'Real-time & AI-Powered',
              desc: 'Kami menghubungkan surplus makanan langsung ke yang membutuhkan, diverifikasi AI dan didistribusikan oleh relawan terorganisir.'
            },
          ].map((item, i) => (
            <div key={i}
              className={`border rounded-3xl p-8 transition-all duration-700 ${item.color} ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${i * 150}ms` }}>
              <div className={`mb-4 ${item.iconColor}`}><MSIcon name={item.icon} size={40} fill={1} /></div>
              <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
              <p className="text-2xl font-black text-orange-400 mb-4">{item.stat}</p>
              <p className="text-stone-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-20 max-w-3xl mx-auto text-center">
          <QuoteIcon className="w-10 h-10 text-orange-400/30 fill-orange-400/30 mx-auto mb-4" />
          <p className="text-2xl text-stone-300 font-serif italic leading-relaxed">
            "Membuang makanan sama dengan mencuri dari meja mereka yang miskin dan lapar."
          </p>
          <p className="mt-4 text-sm font-black text-orange-400 uppercase tracking-widest">— Pope Francis</p>
        </div>
      </div>
    </section>
  );
}


function FeaturesSection() {
  const { ref, inView } = useInView();
  const features = [
    { icon: Zap, color: 'bg-yellow-50 text-yellow-600 border-yellow-100', title: 'AI Food Verification', desc: 'Verifikasi kelayakan dan kehalalan makanan secara otomatis hanya dengan foto. Akurat, cepat, terpercaya.' },
    { icon: Package, color: 'bg-blue-50 text-blue-600 border-blue-100', title: 'Manajemen Inventaris', desc: 'Kelola stok surplus secara real-time, atur jadwal distribusi, dan pantau status setiap item dalam satu dashboard.' },
    { icon: Bike, color: 'bg-green-50 text-green-600 border-green-100', title: 'Jaringan Relawan Aktif', desc: 'Ribuan relawan terverifikasi siap mendistribusikan makanan dari donatur ke penerima dengan aman dan tepat waktu.' },
    { icon: Award, color: 'bg-purple-50 text-purple-600 border-purple-100', title: 'Sistem Gamifikasi', desc: 'Kumpulkan poin, raih badge eksklusif, dan naiki peringkat. Setiap kontribusi mendapat reward yang nyata.' },
    { icon: MapPin, color: 'bg-red-50 text-red-600 border-red-100', title: 'Peta Lokasi Real-time', desc: 'Temukan makanan tersedia di sekitar Anda secara real-time. Lihat jarak, jadwal distribusi, dan detail item langsung di peta.' },
    { icon: BarChart2, color: 'bg-orange-50 text-orange-600 border-orange-100', title: 'Analitik Dampak', desc: 'Dashboard lengkap: CO₂ berkurang, air dihemat, pangan diselamatkan. Ukur dampak nyata kontribusi Anda.' },
  ];

  return (
    <section id="features" ref={ref} className="py-40 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-light opacity-60" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-orange-200">Platform Kami Berbeda</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight text-stone-900 mb-4">
            Teknologi yang Membuat<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">Donasi Jadi Lebih Mudah</span>
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto font-medium">Dibangun dengan AI dan dirancang untuk semua kalangan — dari donatur besar hingga penerima individu.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}
                className={`group bg-white rounded-3xl p-8 border border-stone-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 hover:-translate-y-2 transition-all duration-500 cursor-default ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function RoleSection({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { ref, inView } = useInView();
  // ... roles data remains same ...

  const roles = [
    {
      icon: HeartHandshake,
      gradient: 'from-orange-500 to-yellow-400',
      glow: 'shadow-orange-100',
      tag: 'Donatur',
      title: 'Bisnis & Individu',
      desc: 'Donasikan surplus makanan dari restoran, katering, atau dapur rumah Anda. Raih reputasi CSR dan poin reward.',
      benefits: ['Dashboard inventaris real-time', 'Verifikasi AI otomatis', 'Laporan dampak lingkungan', 'Badge & ranking donatur'],
      cta: 'Mulai Donasi →',
      role: 'individual_donor'
    },
    {
      icon: Users,
      gradient: 'from-teal-500 to-green-400',
      glow: 'shadow-teal-100',
      tag: 'Penerima',
      title: 'Komunitas & Panti',
      desc: 'Temukan makanan layak konsumsi gratis di sekitar Anda. Cocok untuk panti asuhan, komunitas, atau keluarga yang membutuhkan.',
      benefits: ['Akses ribuan donasi aktif', 'Filter berdasarkan lokasi & jenis', 'Klaim via pickup atau delivery', 'Sistem poin bagi penerima aktif'],
      cta: 'Cari Makanan →',
      role: 'recipient'
    },
    {
      icon: Bike,
      gradient: 'from-purple-500 to-indigo-400',
      glow: 'shadow-purple-100',
      tag: 'Relawan',
      title: 'Penggerak Distribusi',
      desc: 'Jadilah penghubung antara donatur dan penerima. Terima misi pengantaran, scan QR, dan kumpulkan poin reward.',
      benefits: ['Pilih misi sesuai lokasi', 'Sistem GIS tracking misi', 'Reward poin & merchandise', 'Sertifikat & pengakuan resmi'],
      cta: 'Jadi Relawan →',
      role: 'volunteer'
    },
  ];

  return (
    <section className="py-40 bg-[#FDFBF7] relative overflow-hidden border-y border-stone-100" ref={ref}>
      <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-stone-200">Bergabunglah Bersama Kami</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight text-stone-900 mb-4">
            Ada Tempat untuk<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">Setiap Dari Anda</span>
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto font-medium">Satu platform, tiga peran, satu tujuan: tidak ada makanan yang terbuang.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i}
                className={`group relative bg-white rounded-3xl p-8 border-2 border-stone-100 hover:border-transparent hover:shadow-2xl ${r.glow} transition-all duration-500 hover:-translate-y-2 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}>
                {/* Gradient top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${r.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 bg-gradient-to-r ${r.gradient} text-white`}>{r.tag}</span>
                <h3 className="text-2xl font-black text-stone-900 mb-3">{r.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6 font-medium">{r.desc}</p>

                <ul className="space-y-2.5 mb-8">
                  {r.benefits.map((b, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-stone-600 font-medium">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <button onClick={() => onNavigate('register')}
                  className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${r.gradient} text-white font-black text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg`}>
                  {r.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function ImpactSection() {
  const { ref, inView } = useInView(0.3);
  // ... stats data ...

  const stats = [
    { value: 5200, suffix: ' kg', label: 'Makanan Diselamatkan', icon: 'lunch_dining', color: 'text-orange-600' },
    { value: 13000, suffix: ' kg', label: 'CO₂ Berkurang', icon: 'eco', color: 'text-green-600' },
    { value: 320, suffix: '+', label: 'Penerima Manfaat', icon: 'people', color: 'text-blue-600' },
    { value: 1200, suffix: '+', label: 'Donasi Berhasil', icon: 'handshake', color: 'text-purple-600' },
    { value: 85, suffix: '+', label: 'Relawan Aktif', icon: 'directions_bike', color: 'text-red-600' },
  ];

  return (
    <section id="impact" ref={ref} className="py-40 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-light opacity-40" />
      <div className="absolute inset-0 bg-dot-pattern opacity-60" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-50/50 to-transparent rounded-full" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-green-200">Dampak Nyata</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight text-stone-900 mb-4">
            Bersama Kita Sudah<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">Melakukan Ini</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((s, i) => {
            const count = useCountUp(s.value, 2000 + i * 200, inView);
            return (
              <div key={i}
                className={`bg-white rounded-3xl p-8 text-center border border-stone-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`flex justify-center mb-4 ${s.color}`}><MSIcon name={s.icon} size={40} fill={1} /></div>
                <p className={`text-4xl font-black ${s.color} mb-2 tabular-nums`}>
                  {count.toLocaleString('id-ID')}{s.suffix}
                </p>
                <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function HowItWorksSection() {
  const { ref, inView } = useInView(0.1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const totalDist = windowHeight + rect.height;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / totalDist));
      // Adjust progress to be more focused on the line drawing area
      const adjustedProgress = Math.max(0, Math.min(1, (progress - 0.2) * 1.5));
      setScrollProgress(adjustedProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      num: '01',
      icon: 'photo_camera',
      iconColor: 'text-orange-500',
      title: 'Foto & Unggah Makanan',
      desc: 'Ambil foto makanan surplus Anda. AI kami akan memverifikasi dalam hitungan detik.',
      sub: 'Donatur → AI Verifikasi',
      color: 'border-orange-200 bg-orange-50 shadow-orange-100',
      align: 'left'
    },
    {
      num: '02',
      icon: 'location_on',
      iconColor: 'text-blue-500',
      title: 'Penerima Klaim & Pilih',
      desc: 'Penerima nearby mendapat notifikasi. Pilih pickup atau delivery via relawan.',
      sub: 'Penerima → Kode QR',
      color: 'border-blue-200 bg-blue-50 shadow-blue-100',
      align: 'right'
    },
    {
      num: '03',
      icon: 'directions_bike',
      iconColor: 'text-green-600',
      title: 'Relawan Antarkan!',
      desc: 'Relawan ambil makanan, antar, dan scan QR untuk konfirmasi serah terima.',
      sub: 'Relawan → Poin & Reward',
      color: 'border-green-200 bg-green-50 shadow-green-100',
      align: 'left'
    },
  ];

  return (
    <section id="how" ref={(el) => { sectionRef.current = el; ref.current = el; }} className="py-40 bg-mesh-light relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-100/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-32 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-200">Interactive Journey</span>
          <h2 className="text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-stone-900 mb-6">
            Langkah Nyata<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-green-600">Penyelamatan Pangan</span>
          </h2>
        </div>

        <div className="relative">
          {/* Winding Vertical Roadmap Line (SVG) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-24 -translate-x-1/2 z-0">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 800" fill="none">
              {/* Static Background Path */}
              <path 
                d="M50 0 C70 150, 30 250, 50 400 C70 550, 30 650, 50 800"
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="text-stone-100" 
              />
              {/* Interactive Growing Path */}
              <path 
                d="M50 0 C70 150, 30 250, 50 400 C70 550, 30 650, 50 800"
                stroke="url(#roadmapGradient)" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset={1000 - (scrollProgress * 1000)}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="roadmapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Steps */}
          <div className="space-y-40 lg:space-y-0">
            {steps.map((s, i) => (
              <div key={i} className={`relative flex flex-col lg:flex-row items-center lg:min-h-[400px] ${s.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Content Side */}
                <div className="w-full lg:w-[calc(50%-80px)] z-10">
                   <div className={`group rounded-[2.5rem] p-10 border-2 ${s.color} transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 ' + (s.align === 'left' ? '-translate-x-12' : 'translate-x-12')}`}
                     style={{ transitionDelay: `${i * 200}ms` }}>
                      <div className="flex items-center justify-between mb-8">
                         <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 ${s.iconColor}`}>
                            <MSIcon name={s.icon} size={32} fill={1} />
                         </div>
                         <span className="text-4xl font-black text-stone-200">{s.num}</span>
                      </div>
                      <h3 className="text-2xl font-black text-stone-900 mb-4">{s.title}</h3>
                      <p className="text-stone-600 text-base leading-relaxed font-medium mb-8">{s.desc}</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 border border-stone-200 rounded-full text-stone-500 text-[11px] font-black uppercase tracking-widest">
                         <Zap className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                         {s.sub}
                      </div>
                   </div>
                </div>

                {/* Road Node (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-20 h-20 items-center justify-center z-20">
                    {/* Node with progress background */}
                    <div className={`relative w-16 h-16 rounded-full bg-white border-2 border-stone-100 shadow-xl flex items-center justify-center transition-all duration-700 ${scrollProgress > (i * 0.33 + 0.1) ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                        <div className={`absolute inset-0.5 rounded-full border-2 border-dashed ${s.iconColor.replace('text', 'border')} animate-[spin_8s_linear_infinite]`} />
                        <div className={`w-4 h-4 rounded-full ${s.iconColor.replace('text', 'bg')} shadow-lg shadow-current/20`} />
                    </div>
                </div>

                <div className="hidden lg:block lg:w-[calc(50%-80px)]" />
              </div>
            ))}
          </div>

          {/* Finish Point */}
          <div className={`mt-24 flex flex-col items-center transition-all duration-1000 ${scrollProgress > 0.9 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'}`}>
             <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-teal-400 shadow-2xl shadow-green-200 flex items-center justify-center mb-4 border-4 border-white animate-bounce">
                <MSIcon name="emoji_events" size={40} className="text-white" fill={1} />
             </div>
             <div className="px-8 py-3 bg-white rounded-2xl border-2 border-green-100 shadow-xl">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 tracking-[0.2em] uppercase italic">Finish</span>
             </div>
             <p className="mt-4 text-stone-400 text-sm font-bold uppercase tracking-widest">Kebaikan Berhasil Disalurkan!</p>
          </div>
        </div>
      </div>
    </section>
  );
}


function TestimonialSection() {
  const { ref, inView } = useInView();
  const testimonials = [
    { name: 'Budi Santoso', role: 'Donatur Korporat · Restoran Berkah', avatar: 'BS', quote: "Akhirnya ada platform yang memudahkan kami mendistribusikan sisa catering secara terorganisir! Dalam sebulan, kami berhasil mendonasikan lebih dari 200 porsi makanan.", stars: 5, color: 'from-orange-500 to-yellow-400' },
    { name: 'Panti Asuhan Kasih Ibu', role: 'Penerima · Bandung', avatar: 'PI', quote: "Setiap minggu kami bisa mendapat makanan bergizi untuk 50 anak. AI verifikasi-nya bikin kami yakin makanan yang diterima aman dan halal.", stars: 5, color: 'from-teal-500 to-green-400' },
    { name: 'Rizki Pratama', role: 'Relawan Sprint · Kota Bandung', avatar: 'RP', quote: "Sistem QR-nya keren banget, misi jadi lebih terarah. Sudah 3 bulan jadi relawan dan poin yang terkumpul bisa ditukar merchandise yang bagus!", stars: 5, color: 'from-purple-500 to-indigo-400' },
  ];

  return (
    <section ref={ref} className="py-32 bg-orange-50/20 border-y border-orange-100/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-yellow-200">Cerita Mereka</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight text-stone-900 mb-4">
            Dipercaya Ribuan<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">Pengguna Aktif</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i}
              className={`bg-white rounded-3xl p-8 border border-stone-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${i * 150}ms` }}>
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <QuoteIcon className="w-8 h-8 text-stone-200 fill-stone-200 mb-4" />
              <p className="text-stone-700 text-sm leading-relaxed font-medium mb-8 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-black text-stone-900 text-sm">{t.name}</p>
                  <p className="text-stone-500 text-xs font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function GamificationSection() {
  const { ref, inView } = useInView();
  const ranks = [
    { name: 'Donatur Pemula', icon: 'eco', iconColor: 'text-stone-400', pts: '0 pts', color: 'bg-stone-400', fill: 10 },
    { name: 'Sahabat Pangan', icon: 'handshake', iconColor: 'text-blue-400', pts: '500 pts', color: 'bg-blue-500', fill: 30 },
    { name: 'Juragan Berkah', icon: 'workspace_premium', iconColor: 'text-yellow-400', pts: '2.000 pts', color: 'bg-yellow-500', fill: 60 },
    { name: 'Sultan Donasi', icon: 'diamond', iconColor: 'text-purple-400', pts: '5.000 pts', color: 'bg-purple-600', fill: 100 },
  ];

  return (
    <section id="gamification" ref={ref} className="py-40 bg-mesh-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-purple-500/30">Lebih dari Sekadar Donasi</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight mb-6">
            Setiap Kontribusi<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Berbuah Reward</span>
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed font-medium mb-8">
            Sistem gamifikasi kami memastikan setiap tindakan baik mendapat pengakuan. Dari poin hingga badge eksklusif, naiki peringkat dan raih benefit nyata.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'lunch_dining', action: 'Donasi 1 kg makanan', pts: '+10 poin' },
              { icon: 'star', action: 'Rating sempurna', pts: '+5 poin' },
              { icon: 'inventory_2', action: 'Misi antar selesai', pts: '+50 poin' },
              { icon: 'local_fire_department', action: 'Zero Waste Streak', pts: '+50 poin' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <div className="text-orange-300 mb-2"><MSIcon name={item.icon} size={24} fill={1} /></div>
                <p className="text-stone-300 text-xs font-medium mb-1">{item.action}</p>
                <p className="text-orange-400 font-black text-sm">{item.pts}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-stone-400 text-xs font-black uppercase tracking-widest mb-6">Sistem Rank Donatur</p>
            <div className="space-y-5">
              {ranks.map((r, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={`w-8 text-center ${r.iconColor}`}><MSIcon name={r.icon} size={24} fill={1} /></span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-white font-bold text-sm">{r.name}</p>
                      <p className="text-stone-400 text-xs font-bold">{r.pts}</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full transition-all duration-1000`}
                        style={{ width: inView ? `${r.fill}%` : '0%', transitionDelay: `${300 + i * 150}ms` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-stone-400 text-xs font-black uppercase tracking-widest mb-4">Badge Terpopuler</p>
              <div className="flex gap-3">
                {[
                  { icon: 'public', iconColor: 'text-green-400', name: 'Zero Waste Hero', color: 'bg-green-900/50 border-green-700' },
                  { icon: 'bolt', iconColor: 'text-yellow-400', name: 'Speed Runner', color: 'bg-yellow-900/50 border-yellow-700' },
                  { icon: 'rocket_launch', iconColor: 'text-purple-400', name: 'Early Adopter', color: 'bg-purple-900/50 border-purple-700' },
                ].map((b, i) => (
                  <div key={i} className={`flex-1 border rounded-2xl p-3 text-center ${b.color}`}>
                    <div className={`flex justify-center mb-1 ${b.iconColor}`}><MSIcon name={b.icon} size={24} fill={1} /></div>
                    <p className="text-white text-[10px] font-black">{b.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function FAQSection() {
  const { ref, inView } = useInView();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: 'Apakah Food AI Rescue sepenuhnya gratis?', a: 'Ya! Platform ini 100% gratis untuk semua pengguna — donatur, penerima, maupun relawan. Kami beroperasi dengan dukungan komunitas dan mitra korporat.' },
    { q: 'Bagaimana AI memverifikasi kelayakan makanan?', a: 'AI kami menganalisis foto makanan yang diunggah untuk menilai kondisi, perkiraan kehalalan, dan kelayakan konsumsi berdasarkan visual, warna, dan metadata. Prosesnya hanya butuh beberapa detik.' },
    { q: 'Siapa yang bisa mendaftar sebagai donatur?', a: 'Siapa saja! Dari individu yang memasak di rumah, UMKM katering, restoran, hotel, hingga korporasi besar dengan program CSR. Semua level donatur diterima.' },
    { q: 'Apakah ada batasan wilayah untuk menggunakan platform ini?', a: 'Saat ini kami beroperasi di Kota Bandung dan sekitarnya. Ekspansi ke kota-kota lain sedang dalam perencanaan dan akan diumumkan segera.' },
    { q: 'Bagaimana keamanan data pribadi saya?', a: 'Data Anda dilindungi dengan enkripsi standar industri. Kami tidak menjual data ke pihak ketiga dan hanya menggunakan informasi Anda untuk operasional platform.' },
    { q: 'Apa yang terjadi jika penerima tidak datang mengambil makanan?', a: 'Penerima yang tidak datang tanpa kabar akan dikenai pinalti poin. Makanan akan ditawarkan kembali ke penerima lain secara otomatis agar tidak terbuang.' },
  ];

  return (
    <section id="faq" ref={ref} className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-stone-200">Pertanyaan Umum</span>
          <h2 className="text-5xl font-black tracking-tighter leading-tight text-stone-900">FAQ</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i}
              className={`border rounded-2xl overflow-hidden transition-all duration-500 ${open === i ? 'border-orange-200 shadow-lg shadow-orange-50' : 'border-stone-200 hover:border-stone-300'} ${inView ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: `${i * 60}ms` }}>
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-black text-stone-900 pr-8">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-orange-500 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-stone-600 text-sm leading-relaxed font-medium animate-in slide-in-from-top-2 duration-200 border-t border-stone-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function CTASection({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} className="py-40 bg-mesh-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-orange-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-yellow-500/30 rounded-full blur-[100px]" />

      <div className={`relative max-w-4xl mx-auto px-6 text-center transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex justify-center text-orange-400 mb-8"><MSIcon name="public" size={64} fill={1} /></div>
        <h2 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white mb-6">
          Mulai Sekarang.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-300">
            Selamatkan Pangan.
          </span>
        </h2>
        <p className="text-stone-400 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          Bergabung bersama ribuan donatur, relawan, dan penerima yang sudah membuat perubahan nyata. Gratis, tanpa kartu kredit.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => onNavigate('register')}
            className="group px-10 py-5 bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-orange-900/50 hover:shadow-orange-600/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
            Daftar Gratis Sekarang
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => onNavigate('login')}
            className="px-10 py-5 border-2 border-white/20 text-white font-black text-lg rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
            Saya sudah punya akun
          </button>
        </div>
        <p className="text-stone-600 text-sm font-medium mt-8 flex items-center justify-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1"><MSIcon name="check_circle" size={14} fill={1} className="text-green-500" /> Gratis selamanya</span>
          <span className="text-stone-700">·</span>
          <span className="inline-flex items-center gap-1"><MSIcon name="check_circle" size={14} fill={1} className="text-green-500" /> Tidak perlu kartu kredit</span>
          <span className="text-stone-700">·</span>
          <span className="inline-flex items-center gap-1"><MSIcon name="check_circle" size={14} fill={1} className="text-green-500" /> Setup dalam 2 menit</span>
        </p>
      </div>
    </section>
  );
}


function Footer({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <footer className="bg-stone-950 text-stone-400 pt-20 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white fill-white transform -scale-x-100" />
              </div>
              <span className="font-black text-white text-lg tracking-tighter">
                FOOD <span className="text-orange-500">AI</span> RESCUE
              </span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed font-medium mb-6">
              Selamatkan Makanan, Selamatkan Bumi. Platform penyelamatan pangan berbasis AI untuk komunitas Indonesia.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'share', label: 'X (Twitter)' },
                { icon: 'facebook', label: 'Facebook' },
                { icon: 'photo_camera', label: 'Instagram' },
                { icon: 'play_circle', label: 'YouTube' },
              ].map((s, i) => (
                <button key={i} aria-label={s.label} className="w-10 h-10 bg-stone-800 hover:bg-orange-600 rounded-xl flex items-center justify-center transition-colors text-stone-400 hover:text-white">
                  <MSIcon name={s.icon} size={18} fill={1} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { 
              title: 'Platform', 
              links: [
                { label: 'Fitur', href: '#features' },
                { label: 'Dampak', href: '#impact' },
                { label: 'Cara Kerja', href: '#how' },
                { label: 'Gamifikasi', href: '#gamification' }
              ] 
            },
            { title: 'Bergabung', links: [{ label: 'Daftar sebagai Donatur', href: 'register' }, { label: 'Daftar sebagai Penerima', href: 'register' }, { label: 'Jadi Relawan', href: 'register' }, { label: 'Mitra Korporat', href: 'register' }] },
            { title: 'Tentang', links: [{ label: 'Tentang Kami', href: 'faq' }, { label: 'Blog', href: 'faq' }, { label: 'FAQ', href: '#faq' }, { label: 'Hubungi Kami', href: 'faq' }] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <button onClick={() => {
                      if (typeof link === 'object' && link.href.startsWith('#')) {
                        document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        onNavigate(typeof link === 'object' ? link.href : 'register');
                      }
                    }}
                      className="text-stone-500 hover:text-orange-400 font-medium text-sm transition-colors">
                      {typeof link === 'object' ? link.label : link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2 items-start">
            <img src="/assets/logo-alt.svg" className="h-10 w-auto object-contain bg-white rounded-full p-2 shadow-sm" alt="Food AI Rescue" />
            <p className="text-stone-600 text-sm font-medium inline-flex items-center gap-1.5">
              © 2026 Food AI Rescue. All rights reserved. Made with <MSIcon name="favorite" size={14} fill={1} className="text-red-500" /> for Indonesia.
            </p>
          </div>
          <div className="flex gap-6">
            {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Kebijakan Cookie'].map((link, i) => (
              <button key={i} className="text-stone-600 hover:text-orange-400 font-medium text-xs transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="font-sans antialiased relative overflow-hidden selection:bg-orange-500 selection:text-white">
      <CursorFollower />
      <Navbar onNavigate={onNavigate} />
      <main>
        <HeroSection onNavigate={onNavigate} />
        <ProblemSection />
        <FeaturesSection />
        <RoleSection onNavigate={onNavigate} />
        <ImpactSection />
        <HowItWorksSection />
        <TestimonialSection />
        <GamificationSection />
        <FAQSection />
        <CTASection onNavigate={onNavigate} />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

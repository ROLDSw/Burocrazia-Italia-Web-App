'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Bell,
  Calendar,
  FileText,
  Car,
  Home,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  Star,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { PLANS, type PlanKey } from '@/lib/plans'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-slate-950 shadow-sm border-b border-slate-200/50 dark:border-white/10 ${scrolled ? 'py-3' : 'py-5'
      }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Burocrazia</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-600 dark:text-gray-400">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Funzionalità</a>
          <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Come funziona</a>
          <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Prezzi</a>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-[15px] font-semibold text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-4 py-2"
          >
            Accedi
          </Link>
          <Link
            href="/signup"
            className="text-[15px] font-semibold bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-full px-6 py-2.5 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-lg shadow-slate-900/10"
          >
            Inizia gratis
          </Link>
        </div>

        <button
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-slate-200 dark:border-white/10 bg-white/98 dark:bg-black/95 backdrop-blur-xl px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 shadow-2xl">
          <div className="flex flex-col gap-5">
            <a href="#features" className="text-xl font-bold text-slate-800 dark:text-white" onClick={() => setMenuOpen(false)}>Funzionalità</a>
            <a href="#how-it-works" className="text-xl font-bold text-slate-800 dark:text-white" onClick={() => setMenuOpen(false)}>Come funziona</a>
            <a href="#pricing" className="text-xl font-bold text-slate-800 dark:text-white" onClick={() => setMenuOpen(false)}>Prezzi</a>
          </div>
          <div className="flex flex-col gap-4 pt-6 border-t border-slate-100 dark:border-white/10">
            <Link
              href="/login"
              className="text-center font-bold py-4 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20 rounded-2xl"
              onClick={() => setMenuOpen(false)}
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="text-center font-bold py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl shadow-indigo-500/10"
              onClick={() => setMenuOpen(false)}
            >
              Inizia gratis
            </Link>
            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function PricingCard({ plan, planKey }: { plan: typeof PLANS[PlanKey]; planKey: PlanKey }) {
  const [loading, setLoading] = useState(false)
  const isPro = planKey === 'pro'

  const handleCheckout = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planKey }),
    })

    if (res.status === 401) {
      window.location.href = '/signup'
      return
    }

    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <div className={`relative flex flex-col rounded-[24px] p-6 sm:p-5 transition-all duration-500 ${isPro
      ? 'bg-slate-900 dark:bg-indigo-950 text-white shadow-[0_32px_64px_-16px_rgba(79,70,229,0.4)] dark:shadow-[0_0_60px_-12px_rgba(99,102,241,0.3)] scale-105 z-10 border border-indigo-500/30'
      : 'bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-xl'
      }`}>
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
            PIÙ POPOLARE
          </span>
        </div>
      )}

      <div className="mb-2 sm:mb-3">
        <h3 className={`text-xl font-bold ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          {plan.name}
        </h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className={`text-5xl font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            {plan.price}
          </span>
          <span className={`${isPro ? 'text-slate-400' : 'text-slate-500 dark:text-gray-300'} font-medium`}>/mese</span>
        </div>
        <p className={`mt-4 text-[15px] leading-relaxed ${isPro ? 'text-slate-300' : 'text-slate-500 dark:text-gray-300'}`}>
          {plan.description}
        </p>
      </div>

      <div className={`h-px w-full mb-4 ${isPro ? 'bg-white/10' : 'bg-slate-100'}`} />

      <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-1">
        {plan.features.slice(0, 5).map(feature => (
          <li key={feature} className="flex items-start gap-3">
            <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center ${isPro ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/10'}`}>
              <CheckCircle className={`h-3.5 w-3.5 ${isPro ? 'text-indigo-400' : 'text-slate-400 dark:text-white/40'}`} />
            </div>
            <span className={`text-[15px] ${isPro ? 'text-slate-300' : 'text-slate-600 dark:text-gray-300'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 group ${isPro
          ? 'bg-white text-slate-900 hover:bg-indigo-50 dark:hover:bg-white shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)] active:scale-[0.98]'
          : 'bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 active:scale-[0.98]'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="h-5 w-5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        ) : (
          <>
            {isPro ? 'Prova il piano Pro' : 'Inizia gratis'}
            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen md:h-screen selection:bg-indigo-100 selection:text-indigo-900 overflow-y-auto overflow-x-hidden text-slate-900 bg-transparent md:snap-y md:snap-mandatory scroll-smooth" id="top">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen md:h-screen pt-24 pb-12 md:pt-16 px-6 lg:px-12 overflow-hidden flex flex-col justify-center md:snap-start">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-full px-4 py-1.5 text-[13px] font-bold text-slate-600 dark:text-gray-300 mb-4 sm:mb-8 shadow-sm">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>La burocrazia italiana, semplificata con l'AI</span>
              </div>
              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Gestisci le tue <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">scadenze</span> senza pensieri.
              </h1>
              <p className="mt-4 sm:mt-8 text-lg sm:text-xl text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                Burocrazia raccoglie tutte le tue scadenze — bollo auto, IMU, SPID — in un unico posto intelligente. Per professionisti che non vogliono più pagare multe.
              </p>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold px-8 py-4 text-lg transition shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Prova gratis ora
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-slate-700 dark:text-white font-bold px-8 py-4 text-lg transition hover:bg-white dark:hover:bg-white/10"
                >
                  Accedi al portale
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img
                        src={`https://i.pravatar.cc/150?u=buro${i}`}
                        alt="User"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="h-12 w-12 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shadow-sm">
                    +12k
                  </div>
                </div>
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    1.3M+ Recensioni positive
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center mt-6 sm:mt-8 md:mt-0">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[100px] rounded-full scale-125" />

              <div className="relative w-full aspect-square max-w-xl animate-float">
                <Image
                  src="/images/hero-visual.png"
                  alt="Burocrazia AI Visual"
                  fill
                  sizes="(max-width: 768px) 100vw, 576px"
                  className="object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.2)]"
                  priority
                />

                {/* Floating tags */}
                <div className="absolute top-[20%] right-[-5%] bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 animate-bounce-subtle">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">AI Automatizzata</span>
                </div>

                <div className="absolute bottom-[20%] left-[-5%] bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 animate-bounce-subtle-delayed">
                  <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">Zero Ritardi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Features */}
      <section id="features" className="min-h-screen md:h-screen py-16 md:py-8 px-6 lg:px-12 scroll-mt-20 flex items-center md:snap-start relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Tutto quello che ti serve per essere in regola.
            </h2>
            <p className="mt-4 text-lg lg:text-xl text-slate-800 dark:text-gray-300 font-medium">
              Smetti di rincorrere le scadenze. Lascia che la nostra tecnologia faccia il lavoro sporco per te.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: Bell,
                color: 'bg-indigo-100 text-indigo-600',
                title: 'Smart Notifications',
                desc: 'Alert predittivi via email e SMS. Saprai esattamente cosa fare con 30 giorni di anticipo.',
              },
              {
                icon: ShieldCheck,
                color: 'bg-emerald-100 text-emerald-600',
                title: 'Archiviazione Sicura',
                desc: 'Tutti i tuoi documenti digitali protetti da crittografia end-to-end. Mai più fogli smarriti.',
              },
              {
                icon: TrendingUp,
                color: 'bg-purple-100 text-purple-600',
                title: 'AI Insights',
                desc: 'La nostra AI analizza i tuoi documenti e ti suggerisce come ottimizzare le tue scadenze.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group p-4 sm:p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500 flex items-center gap-6">
                <div className={`flex-shrink-0 inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-slate-800 dark:text-gray-100 text-sm sm:text-base leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="min-h-screen md:h-screen py-16 md:py-8 px-6 lg:px-12 relative overflow-hidden scroll-mt-20 flex items-center md:snap-start">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 sm:mb-8">
                Come funziona <br />
                <span className="text-indigo-600 dark:text-indigo-400">Burocrazia</span>
              </h2>
              <div className="space-y-12">
                {[
                  {
                    step: "01",
                    title: "Connetti i tuoi documenti",
                    desc: "Carica una foto o un PDF del tuo bollo, della TARI o di qualsiasi avviso. La nostra AI estrarrà automaticamente dati e scadenze."
                  },
                  {
                    step: "02",
                    title: "Pianificazione Intelligente",
                    desc: "Il sistema crea un calendario personalizzato e ti invia promemoria strategici prima che sia troppo tardi."
                  },
                  {
                    step: "03",
                    title: "Zero Pensieri",
                    desc: "Ricevi alert pronti all'uso, con link diretti al pagamento o istruzioni chiare su come procedere."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="text-4xl font-black text-indigo-600/80 dark:text-indigo-400 leading-none">{item.step}</div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-slate-800 dark:text-gray-100 leading-relaxed font-semibold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative mt-12 md:mt-0">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full scale-110" />
              <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-2 sm:p-4 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                  alt="Dashboard Preview"
                  className="rounded-2xl shadow-inner w-full h-auto"
                />
                <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-4 bg-indigo-600 text-white p-4 sm:p-6 rounded-2xl shadow-xl animate-bounce-subtle hidden sm:block">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                  <p className="mt-2 font-bold text-sm sm:text-base">Documenti Analizzati</p>
                  <p className="text-xs opacity-80">Processati in tempo reale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="min-h-screen md:h-screen py-16 md:py-4 px-6 lg:px-12 bg-transparent relative scroll-mt-20 flex flex-col justify-center md:snap-start">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
            <h2 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Prezzi chiari, zero sorprese.
            </h2>
            <p className="mt-2 text-lg text-slate-800 dark:text-gray-300 font-medium">
              Scegli il piano perfetto per te.
            </p>
          </div>

          <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8 sm:gap-8 max-w-4xl mx-auto mt-12 sm:mt-0">
            {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => (
              <PricingCard key={key} planKey={key} plan={plan} />
            ))}
          </div>

          <div className="mt-4 sm:mt-5 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-bold shadow-lg">
              <Clock className="h-3 w-3" />
              <span>Pagamenti sicuri con Stripe</span>
            </div>
            <p className="text-slate-400 dark:text-indigo-200 text-[10px] font-medium">Nessuna carta di credito richiesta per iniziare</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 px-6 lg:px-12 border-t border-slate-100 dark:border-white/10 snap-start bg-white/30 dark:bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-3 mb-6"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">Burocrazia</span>
            </Link>
            <p className="text-slate-800 dark:text-gray-300 text-lg max-w-sm leading-relaxed mb-8">
              Il modo più professionale e sicuro per gestire le scadenze burocratiche in Italia. Progettato per l'eccellenza operativa.
            </p>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Prodotto</h4>
            <ul className="space-y-4 text-slate-800 dark:text-gray-400 font-medium">
              <li><a href="#features" className="hover:text-indigo-600 transition">Funzionalità</a></li>
              <li><a href="#pricing" className="hover:text-indigo-600 transition">Prezzi</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-600 transition">AI Assistant</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Supporto</h4>
            <ul className="space-y-4 text-slate-800 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">Termini di Servizio</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">Contatti</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-800 dark:text-indigo-200 text-sm font-bold text-center md:text-left">
            © 2026 Burocrazia. Tutti i diritti riservati.
          </p>
          <div className="flex gap-8 text-slate-700 dark:text-indigo-200 text-sm font-bold text-center md:text-right">
            <span>Orgogliosamente sviluppato con eccellenza in Italia</span>
          </div>
        </div>
      </footer>

      {/* Custom Styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
        .animate-bounce-subtle-delayed {
          animation: bounce-subtle 4s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  )
}

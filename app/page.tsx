'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './providers';
import { ArrowRight, Mic, Zap, BookOpen, Code2, MessageSquare } from 'lucide-react';

function FaduMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="url(#fml)"/>
      <defs>
        <linearGradient id="fml" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED"/>
          <stop offset="1" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      <text x="18" y="25" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" fill="white">F</text>
    </svg>
  );
}

const team = [
  {
    initial: 'A',
    name: 'Alex',
    role: 'Senior FDE',
    color: 'from-violet-500 to-violet-700',
    glow: 'shadow-violet-500/30',
    desc: 'Your hands-on Vapi engineer. SDKs, latency, tool calling, webhooks — Alex has you covered.',
    tags: ['Latency', 'SDKs', 'Webhooks'],
  },
  {
    initial: 'S',
    name: 'Sarah',
    role: 'Customer Success',
    color: 'from-cyan-500 to-cyan-700',
    glow: 'shadow-cyan-500/30',
    desc: 'Onboarding, pricing, account questions — Sarah makes sure you hit your goals from day one.',
    tags: ['Pricing', 'Onboarding', 'Plans'],
  },
  {
    initial: 'J',
    name: 'Jordan',
    role: 'Solutions Engineer',
    color: 'from-fuchsia-500 to-fuchsia-700',
    glow: 'shadow-fuchsia-500/30',
    desc: 'Enterprise deployments, Squads, custom LLM pipelines — Jordan designs the architecture.',
    tags: ['Squads', 'Enterprise', 'Custom LLM'],
  },
];

const steps = [
  { icon: <Mic size={20} />, n: '01', title: 'Start a voice session', body: 'Hit the mic button. The Deployment Manager greets you and routes you to the right expert in seconds.' },
  { icon: <MessageSquare size={20} />, n: '02', title: 'Ask anything about Vapi', body: 'Features, pricing, SDKs, errors — the team searches the live knowledge base and answers aloud.' },
  { icon: <Code2 size={20} />, n: '03', title: 'Get fixes to your workspace', body: 'Code snippets and SQL migrations land in your workspace while your FDE explains it live.' },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col overflow-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-gray-200/60 shadow-sm shadow-black/[0.03]">
        <Link href="/" className="flex items-center gap-2.5">
          <FaduMark />
          <div className="leading-tight">
            <span className="font-extrabold text-sm tracking-tight text-gray-900">Fadu</span>
            <span className="text-[10px] font-medium text-violet-600 block -mt-0.5">The Forward Avengers</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/auth?mode=signin" className="text-sm text-gray-500 hover:text-gray-900 transition px-3 py-1.5 font-medium rounded-lg hover:bg-gray-100">
            Sign in
          </Link>
          <Link href="/auth?mode=signup" className="text-sm bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white px-4 py-1.5 rounded-lg transition font-semibold shadow-lg shadow-violet-500/20">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blob-float absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-violet-400/15 blur-3xl" />
          <div className="blob-float2 absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="blob-float3 absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-fuchsia-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-50 to-cyan-50 border border-violet-200/60 text-violet-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <Zap size={11} className="text-cyan-500" />
            Powered by Vapi · Live Voice AI · Real-Time Knowledge
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-5 leading-[1.05]">
            Meet{' '}
            <span className="shimmer-text">Fadu.</span>
            <br />
            <span className="text-gray-800">The Forward Avengers.</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
            Vapi&apos;s AI team — on a live voice call, any time. Expert answers on SDKs, pricing, architecture, and production troubleshooting, instantly.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth?mode=signup"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white px-7 py-3.5 rounded-2xl font-bold transition shadow-xl shadow-violet-500/30 text-sm"
            >
              Talk to your FDE
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/auth?mode=signin"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-7 py-3.5 rounded-2xl font-semibold transition text-sm shadow-sm hover:shadow-md"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Floating tag cloud */}
        <div className="relative mt-16 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto opacity-70">
          {['Latency', 'Pricing', 'Webhooks', 'SDKs', 'Squads', 'Tool Calling', 'Custom LLM', 'Phone Numbers', 'Voice Providers', 'Transcription'].map((tag) => (
            <span key={tag} className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="px-6 py-20 relative">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 text-center mb-3">Your team</p>
          <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-900">Three experts, one call.</h2>
          <p className="text-gray-500 text-center text-sm mb-12">The Deployment Manager routes you automatically.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {team.map((m) => (
              <div
                key={m.name}
                className="group relative bg-white rounded-3xl p-7 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Gradient top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.color}`} />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} shadow-lg ${m.glow} flex items-center justify-center text-white font-extrabold text-xl mb-5`}>
                  {m.initial}
                </div>

                <h3 className="font-extrabold text-gray-900 text-lg">{m.name}</h3>
                <p className="text-xs font-semibold text-violet-600 mb-3">{m.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{m.desc}</p>

                <div className="flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span key={t} className="text-[11px] bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="blob-float2 absolute right-0 top-0 w-80 h-80 rounded-full bg-violet-100/60 blur-3xl" />
          <div className="blob-float absolute left-0 bottom-0 w-80 h-80 rounded-full bg-cyan-100/60 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 text-center mb-3">How it works</p>
          <h2 className="text-3xl font-extrabold text-center mb-14 text-gray-900">Expert help in three steps.</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map(({ icon, n, title, body }) => (
              <div key={n} className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                    {icon}
                  </div>
                  <span className="text-xs font-bold text-gray-300 font-mono ml-auto">{n}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-600" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="blob-float absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="blob-float2 absolute -bottom-20 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" className="mx-auto">
              <text x="18" y="26" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="20" fill="white">F</text>
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Your Vapi FDE is <br />one call away.
          </h2>
          <p className="text-violet-200 text-sm mb-8">Free to get started. No credit card required.</p>
          <Link
            href="/auth?mode=signup"
            className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-violet-700 px-8 py-4 rounded-2xl font-bold transition shadow-xl text-sm"
          >
            Create your account
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200/60 px-6 py-6 text-center text-xs text-gray-400">
        Fadu · The Forward Avengers · Built for Midsummer Hackathon · Powered by Vapi, Nebius &amp; Insforge
      </footer>
    </div>
  );
}

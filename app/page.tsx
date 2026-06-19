'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './providers';
import { Mic, Zap, Shield, ArrowRight, Database, Code2, MessageSquare, BookOpen, Phone } from 'lucide-react';

function FaduLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="url(#fg)"/>
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED"/>
          <stop offset="1" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      <text x="18" y="25" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" fill="white">F</text>
    </svg>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <FaduLogo />
          <div>
            <span className="font-bold text-sm tracking-tight text-gray-900">Fadu</span>
            <span className="ml-2 text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">The Forward Avengers</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth?mode=signin"
            className="text-sm text-gray-500 hover:text-gray-900 transition px-3 py-1.5 font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=signup"
            className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg transition font-medium shadow-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-100 rounded-full blur-2xl opacity-40" />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={11} />
            Powered by Vapi · Real-Time Voice · AI Knowledge Base
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight text-gray-900">
            Meet{' '}
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Fadu.
            </span>
            <br />The Forward Avengers.
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Vapi&apos;s AI-powered Forward-Deployed team — on call over live voice.
            Get expert answers on pricing, SDKs, assistant config, webhooks, and production troubleshooting — instantly.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth?mode=signup"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-violet-600/20 text-sm"
            >
              Talk to your FDE <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth?mode=signin"
              className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl font-semibold transition text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3 text-gray-900">
            How it works
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">Your Vapi FDE is one voice call away</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic size={22} className="text-violet-600" />,
                step: '01',
                title: 'Start a voice session',
                body: 'Click the mic to connect live with Alex, your Vapi FDE. No forms, no tickets — just talk.',
              },
              {
                icon: <BookOpen size={22} className="text-cyan-600" />,
                step: '02',
                title: 'Ask anything about Vapi',
                body: 'Pricing, SDK usage, assistant config, latency issues, tool calling — Alex knows it all and pulls from a live knowledge base.',
              },
              {
                icon: <Code2 size={22} className="text-green-600" />,
                step: '03',
                title: 'Get fixes in your workspace',
                body: 'Code snippets and SQL migrations appear in your dashboard while Alex explains the solution aloud.',
              },
            ].map(({ icon, step, title, body }) => (
              <div
                key={step}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-xs font-mono text-gray-400">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-gray-100 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-10 text-gray-900">What your FDE can help with</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: <Phone size={16} />, label: 'Phone number setup' },
              { icon: <Mic size={16} />, label: 'Voice & TTS tuning' },
              { icon: <Zap size={16} />, label: 'Latency optimization' },
              { icon: <Code2 size={16} />, label: 'SDK integration' },
              { icon: <Database size={16} />, label: 'Schema & architecture' },
              { icon: <MessageSquare size={16} />, label: 'Webhook & tool calling' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700">
                <span className="text-violet-600">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 px-6 py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <Shield size={28} className="text-violet-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Ready to talk to your FDE?</h2>
          <p className="text-gray-500 text-sm mb-8">
            Free to get started. No credit card required.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-violet-600/20 text-sm"
          >
            Create your account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-6 text-center text-xs text-gray-400">
        Vapi FDE Team · Built for Midsummer Hackathon · Powered by Vapi, Nebius, and Insforge
      </footer>
    </div>
  );
}

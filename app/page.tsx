'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './providers';
import { Terminal, Mic, Zap, Shield, ArrowRight, Database, Code2 } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800/60 px-6 py-4 flex items-center justify-between backdrop-blur-sm sticky top-0 z-10 bg-gray-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Terminal size={15} className="text-white" />
          </div>
          <span className="font-semibold text-base tracking-tight">ArchitectAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth?mode=signin"
            className="text-sm text-gray-400 hover:text-gray-100 transition px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=signup"
            className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap size={11} />
            AI-Powered · Live Voice · Real-Time Fixes
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Your Database has a Problem.{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Alex can fix it.
            </span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Talk to your AI Forward-Deployed Engineer over live voice. Upload your schema,
            describe the issue, and get a SQL migration script pushed to your screen in seconds.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth?mode=signup"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-violet-600/30 text-sm"
            >
              Start a session <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth?mode=signin"
              className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-800/60 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-200">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic size={22} className="text-violet-400" />,
                step: '01',
                title: 'Connect over voice',
                body: 'Open a live voice session with Alex, your AI database engineer. No typing needed.',
              },
              {
                icon: <Database size={22} className="text-cyan-400" />,
                step: '02',
                title: 'Upload your schema',
                body: 'Drop a screenshot of your DB schema. Alex analyses the image in real time.',
              },
              {
                icon: <Code2 size={22} className="text-green-400" />,
                step: '03',
                title: 'Get a SQL fix instantly',
                body: 'A migration script is pushed directly to your dashboard while Alex explains the issue aloud.',
              },
            ].map(({ icon, step, title, body }) => (
              <div
                key={step}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-xs font-mono text-gray-600">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-gray-800/60 px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Shield size={28} className="text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Ready to diagnose your database?</h2>
          <p className="text-gray-500 text-sm mb-8">
            Free to get started. No credit card required.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-violet-600/20 text-sm"
          >
            Create your account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-800/60 px-6 py-6 text-center text-xs text-gray-600">
        Built for Midsummer Hackathon · Powered by Vapi, Nebius, and Insforge
      </footer>
    </div>
  );
}

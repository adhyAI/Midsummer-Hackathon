'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Vapi from '@vapi-ai/web';
import { createClient } from '@insforge/sdk';
import {
  Mic, MicOff, Upload, Terminal, Loader2, Radio,
  LogOut, User, Copy, Check, ChevronRight,
} from 'lucide-react';
import { useAuth, getInsforgeClient } from '../providers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TranscriptEntry = { role: 'user' | 'assistant'; text: string; ts: number };
type PanelState = 'upload' | 'sql';

const FALLBACK_SCHEMA_URL =
  'https://raw.githubusercontent.com/bregman-arie/devops-exercises/master/images/db_schema_example.png';

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  const vapiRef = useRef<Vapi | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const imageUrlRef = useRef<string>(FALLBACK_SCHEMA_URL);

  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [panelState, setPanelState] = useState<PanelState>('upload');
  const [sqlCode, setSqlCode] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth?mode=signin');
  }, [user, authLoading, router]);

  // Keep image URL ref fresh
  useEffect(() => {
    imageUrlRef.current = uploadedImageUrl ?? FALLBACK_SCHEMA_URL;
  }, [uploadedImageUrl]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Auto-switch to SQL panel when code arrives
  useEffect(() => {
    if (sqlCode) setPanelState('sql');
  }, [sqlCode]);

  // ── Insforge Realtime ──────────────────────────────────────────────────────
  useEffect(() => {
    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    });

    let subscribed = false;

    async function setup() {
      await insforge.realtime.connect();
      const res = await insforge.realtime.subscribe('sql-fixes');
      if (!res.ok) return;
      subscribed = true;
      insforge.realtime.on('sql_fix', (payload: { sql?: string }) => {
        if (payload?.sql) setSqlCode(payload.sql);
      });
    }

    setup().catch(console.error);

    return () => {
      if (subscribed) insforge.realtime.unsubscribe('sql-fixes');
      insforge.realtime.disconnect();
    };
  }, []);

  // ── Vapi ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    vapiRef.current = vapi;

    vapi.on('call-start', () => { setCallActive(true); setConnecting(false); });
    vapi.on('call-end', () => { setCallActive(false); setConnecting(false); setIsSpeaking(false); });
    vapi.on('speech-start', () => setIsSpeaking(true));
    vapi.on('speech-end', () => setIsSpeaking(false));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('message', (msg: any) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        setTranscript((prev) => [
          ...prev,
          { role: msg.role, text: msg.transcript, ts: Date.now() },
        ]);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('error', (err: any) => { console.error('[Vapi]', err); setConnecting(false); });

    return () => { vapi.stop(); };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    if (callActive) { vapi.stop(); return; }
    setConnecting(true);
    setTranscript([]);
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
      variableValues: { schema_image_url: imageUrlRef.current },
    });
  }, [callActive]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = (await res.json()) as { url?: string };
      if (data.url) setUploadedImageUrl(data.url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    const insforge = getInsforgeClient();
    await insforge.auth.signOut();
    await refresh();
    router.replace('/');
  }, [refresh, router]);

  const copySQL = useCallback(() => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sqlCode]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={28} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">

      {/* ── Top nav ── */}
      <header className="border-b border-gray-800 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Terminal size={13} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">ArchitectAI</span>
          {callActive && (
            <div className="flex items-center gap-1.5 text-green-400 text-xs ml-2 bg-green-400/10 px-2.5 py-1 rounded-full">
              <Radio size={11} className="animate-pulse" />
              Live
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User size={13} />
              <span>{(user as { email: string }).email}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      {/* ── Main split ── */}
      <main className="flex flex-1 overflow-hidden">

        {/* ═══════════════════════════════════════════
            LEFT — Conversation / Text window
        ═══════════════════════════════════════════ */}
        <section className="w-1/2 flex flex-col border-r border-gray-800 overflow-hidden">
          {/* Section label */}
          <div className="px-5 py-3 border-b border-gray-800/60 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">
              Conversation
            </p>
          </div>

          {/* Transcript scroll area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-gray-700 select-none">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-1">
                  <Mic size={20} className="text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Start a session to see the conversation</p>
                <p className="text-xs text-gray-700 max-w-[220px] leading-relaxed">
                  Alex and Sarah will appear here as you speak.
                </p>
              </div>
            ) : (
              transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {entry.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      entry.role === 'user'
                        ? 'bg-violet-600/20 text-violet-100 rounded-tr-sm'
                        : 'bg-gray-800/80 text-gray-200 rounded-tl-sm'
                    }`}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 opacity-40">
                      {entry.role === 'user' ? 'You' : 'Alex / Sarah'}
                    </span>
                    {entry.text}
                  </div>
                  {entry.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-gray-500" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Typing / speaking indicator */}
          {isSpeaking && (
            <div className="px-5 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-cyan-400 text-xs bg-cyan-400/5 border border-cyan-400/10 rounded-xl px-3 py-2">
                <span className="inline-flex gap-[3px] items-end">
                  {[10, 16, 12].map((h, n) => (
                    <span
                      key={n}
                      className="w-[3px] rounded-full bg-cyan-400 animate-bounce"
                      style={{ height: h, animationDelay: `${n * 0.12}s` }}
                    />
                  ))}
                </span>
                Alex is speaking…
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════
            RIGHT — Voice + Dynamic panel
        ═══════════════════════════════════════════ */}
        <section className="w-1/2 flex flex-col overflow-hidden">

          {/* ── Voice control strip ── */}
          <div className="border-b border-gray-800 px-5 py-4 shrink-0 flex items-center gap-4">
            {/* Mic button */}
            <button
              onClick={toggleCall}
              disabled={connecting}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg shrink-0 ${
                callActive
                  ? 'bg-red-500 hover:bg-red-400 shadow-red-500/30'
                  : connecting
                  ? 'bg-yellow-500 cursor-wait shadow-yellow-500/20'
                  : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30'
              }`}
            >
              {connecting ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : callActive ? (
                <MicOff size={20} className="text-white" />
              ) : (
                <Mic size={20} className="text-white" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-200">
                {callActive ? 'Session active' : connecting ? 'Connecting…' : 'Start voice session'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {callActive
                  ? 'Speak naturally — Alex is listening'
                  : 'Click the mic to connect with your AI FDE'}
              </p>
            </div>

            {callActive && (
              <div className="shrink-0 flex gap-[3px] items-end">
                {[8, 14, 10, 16, 9].map((h, n) => (
                  <span
                    key={n}
                    className="w-[3px] rounded-full bg-violet-400 animate-bounce opacity-80"
                    style={{ height: h, animationDelay: `${n * 0.08}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Dynamic panel ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 pt-3 pb-0 shrink-0">
              {(['upload', 'sql'] as PanelState[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPanelState(tab)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    panelState === tab
                      ? tab === 'upload'
                        ? 'bg-violet-600/20 text-violet-300'
                        : 'bg-cyan-600/20 text-cyan-300'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {tab === 'upload' ? 'Schema Upload' : 'Generated Fix'}
                  {tab === 'sql' && sqlCode && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden p-4">

              {/* Panel A — Upload */}
              {panelState === 'upload' && (
                <div className="h-full flex flex-col gap-3">
                  <p className="text-xs text-gray-600">
                    Upload your DB schema screenshot so Alex can analyse it during the call.
                  </p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group relative overflow-hidden"
                  >
                    {uploadPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={uploadPreview}
                        alt="Schema"
                        className="object-contain max-h-full max-w-full rounded-xl"
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 group-hover:border-violet-500/30 flex items-center justify-center transition">
                          <Upload size={20} className="text-gray-600 group-hover:text-violet-400 transition" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 group-hover:text-gray-300 transition font-medium">
                            Click to upload schema
                          </p>
                          <p className="text-xs text-gray-700 mt-0.5">PNG, JPG, WEBP · max 10 MB</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <ChevronRight size={12} /> Then start a voice session
                        </div>
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <Loader2 size={28} className="text-violet-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {uploadedImageUrl && (
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/5 border border-green-400/10 rounded-xl px-3 py-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      Schema ready — Alex will analyse this during the call
                    </div>
                  )}
                </div>
              )}

              {/* Panel B — SQL fix */}
              {panelState === 'sql' && (
                <div className="h-full flex flex-col gap-3">
                  {sqlCode ? (
                    <>
                      <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <p className="text-xs font-semibold text-green-400">
                            Migration script — pushed by Alex
                          </p>
                        </div>
                        <button
                          onClick={copySQL}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition"
                        >
                          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="flex-1 overflow-auto bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm text-green-300 font-mono leading-relaxed whitespace-pre-wrap">
                        {sqlCode}
                      </pre>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-700 select-none">
                      <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                        <Terminal size={20} className="text-gray-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Waiting for analysis</p>
                      <p className="text-xs text-gray-700 text-center max-w-[200px] leading-relaxed">
                        Upload your schema and tell Alex you&apos;re hitting connection limits.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

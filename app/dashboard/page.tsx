'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Vapi from '@vapi-ai/web';
import { createClient } from '@insforge/sdk';
import {
  Mic, MicOff, Upload, Loader2, Radio,
  LogOut, User, Copy, Check, Send, Paperclip, Plus,
} from 'lucide-react';
import { useAuth, getInsforgeClient } from '../providers';

type MsgRole = 'user' | 'assistant' | 'system';
type Message = { id: number; role: MsgRole; text: string };
type RightTab = 'voice' | 'workspace';

const FALLBACK_SCHEMA_URL =
  'https://raw.githubusercontent.com/bregman-arie/devops-exercises/master/images/db_schema_example.png';

let msgId = 0;
const nextId = () => ++msgId;

function VapiLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#5865F2"/>
      <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  const vapiRef = useRef<Vapi | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const imageUrlRef = useRef<string>(FALLBACK_SCHEMA_URL);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [sessionNum, setSessionNum] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'system',
      text: "Hi! I'm Alex, your Vapi FDE. Chat with me here or start a voice session on the right. I can answer questions about Vapi's platform, pricing, SDKs, and help troubleshoot your integration.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const [rightTab, setRightTab] = useState<RightTab>('voice');
  const [sqlCode, setSqlCode] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth?mode=signin');
  }, [user, authLoading, router]);

  useEffect(() => {
    imageUrlRef.current = uploadedImageUrl ?? FALLBACK_SCHEMA_URL;
  }, [uploadedImageUrl]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (sqlCode) setRightTab('workspace');
  }, [sqlCode]);

  // Insforge Realtime
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
        if (!payload?.sql) return;
        setSqlCode(payload.sql);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            text: "I've pushed a migration script to your Workspace tab. Switch over to review and copy it.",
          },
        ]);
      });
    }

    setup().catch(console.error);
    return () => {
      if (subscribed) insforge.realtime.unsubscribe('sql-fixes');
      insforge.realtime.disconnect();
    };
  }, []);

  // Vapi
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
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: msg.role === 'user' ? 'user' : 'assistant', text: msg.transcript },
        ]);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('error', (err: any) => { console.error('[Vapi]', err); setConnecting(false); });

    return () => { vapi.stop(); };
  }, []);

  const toggleCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    if (callActive) { vapi.stop(); return; }
    setConnecting(true);
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
      variableValues: { schema_image_url: imageUrlRef.current },
    });
  }, [callActive]);

  const sendTextMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setInputText('');
    setSending(true);

    if (vapiRef.current && callActive) {
      vapiRef.current.send({ type: 'add-message', message: { role: 'user', content: text } });
      setSending(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        role: 'assistant',
        text: "Start a voice session on the right to talk this through with me live — I can answer Vapi questions, review your schema, and push fixes to your workspace.",
      },
    ]);
    setSending(false);
  }, [inputText, sending, callActive]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendTextMessage();
      }
    },
    [sendTextMessage]
  );

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
      if (data.url) {
        setUploadedImageUrl(data.url);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'system', text: 'Schema uploaded. Start a voice session — Alex will analyse it and push a fix to your workspace.' },
        ]);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await getInsforgeClient().auth.signOut();
    await refresh();
    router.replace('/');
  }, [refresh, router]);

  const copySQL = useCallback(() => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sqlCode]);

  const newSession = useCallback(() => {
    if (vapiRef.current && callActive) vapiRef.current.stop();
    setSessionNum((n) => n + 1);
    setMessages([{
      id: nextId(),
      role: 'system',
      text: "New session started. I'm Alex, your Vapi FDE — ask me anything about Vapi, or upload a schema for architecture review.",
    }]);
    setInputText('');
    setSqlCode('');
    setUploadedImageUrl(null);
    setUploadPreview(null);
    setRightTab('voice');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [callActive]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden">

      {/* Nav */}
      <header className="border-b border-gray-200 px-5 h-12 flex items-center justify-between shrink-0 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <VapiLogo />
          <span className="font-semibold text-sm tracking-tight text-gray-900">Vapi FDE Team</span>
          {callActive && (
            <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full ml-1">
              <Radio size={10} className="animate-pulse" /> Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <User size={12} /> {(user as { email: string })?.email}
          </span>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Chat */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 overflow-hidden bg-white">

          <div className="px-4 h-10 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Chat with Alex</span>
              <span className="text-[10px] text-gray-300 font-mono">#{sessionNum}</span>
            </div>
            <button
              onClick={newSession}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 border border-gray-200 hover:border-violet-300 rounded-lg px-2 py-1 transition"
              title="Start a new session"
            >
              <Plus size={11} /> New session
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => {
              if (msg.role === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-center max-w-xs leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-white">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 text-[9px] font-bold text-white">AI</div>
                <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex gap-1 items-center">
                  {[0, 1, 2].map((n) => (
                    <span key={n} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 shrink-0 bg-white">
            <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400 transition">
              <button
                onClick={() => { setRightTab('workspace'); fileInputRef.current?.click(); }}
                className="text-gray-400 hover:text-violet-600 transition shrink-0 pb-0.5"
                title="Upload schema"
              >
                <Paperclip size={16} />
              </button>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Vapi… (Enter to send)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none max-h-32 leading-relaxed"
                style={{ scrollbarWidth: 'none' }}
              />
              <button
                onClick={sendTextMessage}
                disabled={!inputText.trim() || sending}
                className="shrink-0 w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 px-1">
              Shift+Enter for new line · Voice transcript appears here too
            </p>
          </div>
        </div>

        {/* RIGHT — Voice | Workspace */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50">

          {/* Tab bar */}
          <div className="border-b border-gray-200 px-4 h-10 flex items-end gap-0 shrink-0 bg-white">
            {([['voice', 'Voice'], ['workspace', 'Workspace']] as [RightTab, string][]).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`relative px-4 h-full text-xs font-medium transition border-b-2 ${
                  rightTab === tab
                    ? 'text-gray-900 border-violet-600'
                    : 'text-gray-400 border-transparent hover:text-gray-700'
                }`}
              >
                {label}
                {tab === 'workspace' && sqlCode && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Voice tab */}
          {rightTab === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-gray-700">Talk to your Vapi FDE</p>
                <p className="text-xs text-gray-400 mt-1">Ask about pricing, SDKs, latency, tool calling, and more</p>
              </div>

              {/* Mic button */}
              <div className="relative">
                {callActive && (
                  <div className="absolute inset-0 rounded-full bg-violet-400/20 animate-ping" />
                )}
                <button
                  onClick={toggleCall}
                  disabled={connecting}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    callActive
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                      : connecting
                      ? 'bg-yellow-400/80 cursor-wait shadow-yellow-400/20'
                      : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/30 hover:scale-105'
                  }`}
                >
                  {connecting ? (
                    <Loader2 size={32} className="animate-spin text-white" />
                  ) : callActive ? (
                    <MicOff size={32} className="text-white" />
                  ) : (
                    <Mic size={32} className="text-white" />
                  )}
                </button>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-base font-semibold text-gray-800">
                  {callActive ? 'Session active' : connecting ? 'Connecting…' : 'Ready to connect'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {callActive
                    ? 'Click the mic to end the session'
                    : connecting
                    ? 'Setting up secure voice connection…'
                    : 'Click the mic to start talking with Alex'}
                </p>
              </div>

              {/* Speaking wave */}
              {isSpeaking && (
                <div className="flex items-end gap-[4px]">
                  {[14, 22, 18, 28, 16, 24, 12].map((h, n) => (
                    <span
                      key={n}
                      className="w-[4px] rounded-full bg-violet-500 animate-bounce"
                      style={{ height: h, animationDelay: `${n * 0.07}s` }}
                    />
                  ))}
                </div>
              )}

              {/* Schema shortcut */}
              {!uploadedImageUrl ? (
                <button
                  onClick={() => { setRightTab('workspace'); fileInputRef.current?.click(); }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-2.5 transition bg-white shadow-sm"
                >
                  <Upload size={14} /> Upload schema for architecture review
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Schema ready — Alex will analyse it during the call
                </div>
              )}
            </div>
          )}

          {/* Workspace tab */}
          {rightTab === 'workspace' && (
            <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
              {/* Schema upload */}
              <div className="shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Schema Image</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border border-dashed rounded-xl cursor-pointer transition-all group overflow-hidden ${
                    uploadPreview
                      ? 'border-gray-300 h-36'
                      : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50 h-24 flex items-center justify-center gap-3'
                  }`}
                >
                  {uploadPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={uploadPreview} alt="Schema" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <Upload size={16} className="text-gray-400 group-hover:text-violet-600 transition" />
                      <span className="text-sm text-gray-500 group-hover:text-violet-700 transition">Upload DB schema screenshot</span>
                    </>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 size={20} className="text-violet-600 animate-spin" />
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>

              <div className="border-t border-gray-200 shrink-0" />

              {/* SQL output */}
              <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Generated Migration</p>
                  {sqlCode && (
                    <button onClick={copySQL} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition">
                      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>

                {sqlCode ? (
                  <pre className="flex-1 overflow-auto bg-gray-900 border border-gray-300 rounded-xl p-4 text-sm text-green-300 font-mono leading-relaxed whitespace-pre-wrap shadow-inner">
                    {sqlCode}
                  </pre>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-300 rounded-xl bg-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h10M7 12h6M7 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <p className="text-xs text-gray-400">SQL fix will appear here after voice analysis</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

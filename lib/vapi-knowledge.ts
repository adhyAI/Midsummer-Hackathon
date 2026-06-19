export type KBChunk = {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
};

export const KB_CHUNKS: KBChunk[] = [
  {
    id: 'vapi-overview',
    category: 'Overview',
    title: 'What is Vapi?',
    content: `Vapi is a developer-first Voice AI platform that lets you build, test, and deploy voice AI agents in minutes. It handles all the complexity of real-time voice conversations: speech-to-text, LLM inference, text-to-speech, interruption handling, and low-latency WebRTC streaming. You focus on your business logic; Vapi handles the infrastructure. Vapi supports inbound phone calls, outbound calls, and web-based voice sessions in the browser.`,
    tags: ['vapi', 'overview', 'what is', 'platform', 'introduction'],
  },
  {
    id: 'vapi-pricing',
    category: 'Pricing',
    title: 'Vapi Pricing',
    content: `Vapi charges per minute of voice conversation. The base rate is $0.05/min for Vapi infrastructure, on top of the underlying model costs (STT, LLM, TTS). You are only billed for actual call minutes. There is a free tier with $10 of monthly credits for new accounts. Paid plans (Starter, Pro, Enterprise) offer higher concurrent call limits, custom SLAs, and volume discounts. Enterprise plans support custom billing, dedicated infrastructure, and SSO. Visit vapi.ai/pricing for current rates.`,
    tags: ['pricing', 'cost', 'billing', 'free tier', 'credits', 'plans', 'starter', 'pro', 'enterprise'],
  },
  {
    id: 'vapi-assistants',
    category: 'Assistants',
    title: 'Creating and Configuring Assistants',
    content: `A Vapi Assistant is the AI agent that handles voice conversations. Each assistant has: a system prompt (persona and instructions), a voice provider + voice ID for TTS, an LLM model for conversation, a transcriber for STT, and optional tools/functions for taking actions. You can create assistants via the Vapi Dashboard or programmatically via the REST API. Key config fields: name, model (provider + model + systemPrompt), voice (provider + voiceId), transcriber, silenceTimeoutSeconds, maxDurationSeconds, endCallFunctionEnabled, backgroundDenoisingEnabled, and turnDetection settings.`,
    tags: ['assistant', 'create', 'configure', 'system prompt', 'persona', 'setup'],
  },
  {
    id: 'vapi-web-sdk',
    category: 'SDKs',
    title: 'Vapi Web SDK (@vapi-ai/web)',
    content: `The Vapi Web SDK enables browser-based voice sessions over WebRTC. Install: npm install @vapi-ai/web. Usage: import Vapi from '@vapi-ai/web'; const vapi = new Vapi(YOUR_PUBLIC_KEY). Start a call: vapi.start(assistantId, { variableValues: { key: value } }). Stop a call: vapi.stop(). Events: vapi.on('call-start', cb), vapi.on('call-end', cb), vapi.on('speech-start', cb), vapi.on('speech-end', cb), vapi.on('message', cb) for transcripts and tool results, vapi.on('error', cb). Send a message mid-call: vapi.send({ type: 'add-message', message: { role: 'user', content: text } }).`,
    tags: ['web sdk', 'browser', 'javascript', 'typescript', 'webrtc', 'npm', 'install', 'frontend'],
  },
  {
    id: 'vapi-node-sdk',
    category: 'SDKs',
    title: 'Vapi Server SDKs (Node.js, Python)',
    content: `For server-side operations (creating assistants, placing outbound calls, fetching call logs), use the Vapi server SDKs. Node.js: npm install @vapi-ai/server-sdk. Python: pip install vapi-server-sdk. Both wrap the Vapi REST API. Use your Private API Key (from Vapi Dashboard > API Keys) for server SDK auth. Never expose your private key in browser code.`,
    tags: ['node sdk', 'python sdk', 'server', 'api key', 'rest api', 'backend'],
  },
  {
    id: 'vapi-tool-calling',
    category: 'Tool Calling',
    title: 'Function Calling / Tool Calling in Vapi',
    content: `Vapi supports LLM function calling (tools). You define tools in the assistant config under model.tools. Each tool has a name, description, and JSON Schema parameters. When the LLM decides to call a tool during a conversation, Vapi sends a POST request to your server URL with message.type === "tool-calls". Your endpoint receives toolCallList[0].function.name and function.arguments, executes the action, and returns { results: [{ toolCallId, result: "spoken result text" }] }. The result text is spoken back to the user. Keep tool responses under 7.5 seconds to avoid Vapi timeout.`,
    tags: ['tools', 'function calling', 'webhook', 'tool calls', 'server url', 'functions'],
  },
  {
    id: 'vapi-webhook-events',
    category: 'Webhooks',
    title: 'Vapi Webhook Events',
    content: `Vapi sends webhook events to your server URL for various call lifecycle events. Common event types in message.type: "tool-calls" (LLM called a function), "transcript" (speech-to-text output), "status-update" (call state changes), "end-of-call-report" (full call summary after end). For tool calls, respond with { results: [{toolCallId, result}] }. For other events, respond with { received: true } to acknowledge. Set your server URL in the assistant config or in Vapi Dashboard > Settings > Server URL.`,
    tags: ['webhook', 'events', 'server url', 'endpoint', 'status', 'transcript', 'report'],
  },
  {
    id: 'vapi-voice-providers',
    category: 'Voice & TTS',
    title: 'Voice / TTS Providers',
    content: `Vapi supports multiple text-to-speech providers: ElevenLabs (11labs) — highest quality, emotional, natural voices; use voiceId from ElevenLabs dashboard. OpenAI TTS — fast, cost-effective voices (alloy, echo, fable, onyx, nova, shimmer). Deepgram Aura — ultra-low latency TTS, great for quick responses. PlayHT — wide voice variety, supports voice cloning. Cartesia — very low latency. Azure TTS — broad language support. For lowest latency voice response, use Deepgram Aura or Cartesia. For highest quality, use ElevenLabs.`,
    tags: ['voice', 'tts', 'text to speech', '11labs', 'elevenlabs', 'openai', 'deepgram', 'playht', 'cartesia'],
  },
  {
    id: 'vapi-transcribers',
    category: 'Transcription',
    title: 'Speech-to-Text (STT) Providers',
    content: `Vapi supports multiple STT/transcriber providers: Deepgram (recommended, default) — fast, accurate, supports nova-2 and nova-3 models. OpenAI Whisper — high accuracy but higher latency. Gladia — multilingual. Talkscriber — cost-effective. Deepgram nova-2 is the best default choice for English — it's both fast and accurate. Set transcriber in assistant config: { provider: "deepgram", model: "nova-2", language: "en" }.`,
    tags: ['stt', 'transcription', 'speech to text', 'deepgram', 'whisper', 'nova'],
  },
  {
    id: 'vapi-llm-providers',
    category: 'LLM',
    title: 'LLM / AI Model Providers',
    content: `Vapi supports all major LLM providers: OpenAI (gpt-4o, gpt-4o-mini, gpt-4-turbo), Anthropic (claude-3-5-sonnet, claude-3-haiku), Google (gemini-1.5-pro, gemini-1.5-flash), Groq (llama-3.1-70b — ultra-fast inference), Together AI, Perplexity, Anyscale, and custom OpenAI-compatible endpoints. For lowest latency: Groq (llama-3.1-70b) or OpenAI gpt-4o-mini. For highest quality reasoning: GPT-4o or Claude-3.5-Sonnet. Custom endpoints: set provider to "custom-llm" and provide the baseURL.`,
    tags: ['llm', 'openai', 'anthropic', 'groq', 'gemini', 'claude', 'gpt', 'model', 'custom llm'],
  },
  {
    id: 'vapi-phone-numbers',
    category: 'Phone',
    title: 'Phone Numbers (Inbound & Outbound)',
    content: `Vapi supports purchasing phone numbers and making/receiving calls. Buy a number via Vapi Dashboard > Phone Numbers, or bring your own Twilio/Vonage number. Inbound: assign an assistant to a phone number — any call to that number automatically starts a session with the assistant. Outbound: use the Vapi API to place outbound calls programmatically: POST /call with phoneNumber, assistantId, and customer details. Outbound calls are great for appointment reminders, lead follow-ups, and automated surveys.`,
    tags: ['phone', 'number', 'inbound', 'outbound', 'twilio', 'call', 'sip'],
  },
  {
    id: 'vapi-latency',
    category: 'Performance',
    title: 'Reducing Latency in Voice Conversations',
    content: `Voice latency has three components: STT latency + LLM latency + TTS latency. Optimize each: STT — use Deepgram nova-2 or nova-3. LLM — use Groq (Llama 70b, ~0.1s first token) or OpenAI gpt-4o-mini. TTS — use Deepgram Aura or Cartesia for sub-100ms. Also: keep system prompts concise (shorter = faster first token), use streaming (Vapi does this automatically), use backgroundDenoisingEnabled to reduce false triggers. Target end-to-end latency is under 1 second for production voice agents.`,
    tags: ['latency', 'performance', 'speed', 'fast', 'optimize', 'slow', 'delay'],
  },
  {
    id: 'vapi-turn-detection',
    category: 'Configuration',
    title: 'Turn Detection & Interruption Handling',
    content: `Vapi uses smart turn detection to know when a user has stopped speaking. Configure via turnDetection: { onNoPunctuationSeconds: 0.8 } — wait 0.8s after last word if no sentence-ending punctuation. Lower values = faster response but more false triggers. Interruption handling: when a user speaks while the AI is talking, Vapi stops the AI and lets the user speak. backchannelingEnabled: allows brief "uh-huh" responses. endCallFunctionEnabled: assistant can end the call itself. silenceTimeoutSeconds: end call after N seconds of silence.`,
    tags: ['turn detection', 'interruption', 'silence', 'end call', 'backchanneling', 'vad'],
  },
  {
    id: 'vapi-variable-values',
    category: 'Assistants',
    title: 'Variable Values & Dynamic Prompts',
    content: `You can pass dynamic values into an assistant's system prompt at call start using variableValues. In the system prompt, use {{variableName}} placeholders. Pass values when starting a call: vapi.start(assistantId, { variableValues: { customerName: "John", accountId: "123" } }). The placeholders are filled in before the LLM sees the prompt. This is useful for personalizing the assistant with user-specific context (name, account info, plan tier, etc.) without creating separate assistants per user.`,
    tags: ['variable values', 'dynamic', 'prompt', 'template', 'personalize', 'context'],
  },
  {
    id: 'vapi-call-logs',
    category: 'Analytics',
    title: 'Call Logs & Analytics',
    content: `Vapi records all calls with full transcripts, call duration, cost breakdown, and assistant settings used. Access via: Vapi Dashboard > Calls for a visual interface, or GET /call/{callId} via API for programmatic access, or GET /call?assistantId=...&limit=100 to list calls. The end-of-call-report webhook event delivers a full summary after each call including: transcript array, duration, cost, endedReason (user-hangup, assistant-ended, silence-timeout, etc.), and analysis results. Use analytics to identify drop-off points, latency issues, and assistant performance.`,
    tags: ['analytics', 'call logs', 'transcript', 'duration', 'cost', 'reports', 'monitoring'],
  },
  {
    id: 'vapi-squads',
    category: 'Advanced',
    title: 'Vapi Squads (Multi-Agent)',
    content: `Vapi Squads allow multiple AI assistants to collaborate on a single call, with the ability to transfer between them. Use squads for: complex routing (receptionist → specialist), multi-language support (one assistant per language), or dividing tasks (intake → appointment → confirmation). Configure via the squads endpoint or dashboard. Each squad member can have a different voice, LLM, and set of tools. Transfer is triggered by the current assistant calling an end-of-turn transfer tool or by your server-side logic.`,
    tags: ['squad', 'multi-agent', 'transfer', 'routing', 'handoff', 'team'],
  },
  {
    id: 'vapi-bring-your-own-llm',
    category: 'Advanced',
    title: 'Custom / BYOLLM (Bring Your Own LLM)',
    content: `Vapi supports custom LLM endpoints via the OpenAI-compatible streaming chat completions API. Set model.provider to "custom-llm" and model.url to your endpoint. Your endpoint must support: POST with body { messages, stream: true } and return SSE with data: [DONE]. This enables using proprietary models, fine-tuned models, RAG-augmented LLMs, or models hosted on private infrastructure. You can also use Groq, Together, Anyscale, and other OpenAI-compatible providers by setting provider to "openai" and overriding the baseURL via model.url.`,
    tags: ['custom llm', 'byollm', 'openai compatible', 'fine-tuned', 'private model', 'rag'],
  },
  {
    id: 'vapi-errors-common',
    category: 'Troubleshooting',
    title: 'Common Errors and How to Fix Them',
    content: `Common Vapi issues: 1) "Tool call timeout" — your webhook took >7.5s to respond. Fix: make backend faster, use async operations, return a quick response and update later. 2) "Call ended unexpectedly" — check silenceTimeoutSeconds (default 30s), ensure turn detection is tuned. 3) "No audio" — check browser microphone permissions, HTTPS required for WebRTC. 4) "High latency" — switch to Groq LLM and Deepgram TTS/STT. 5) "Assistant not responding" — verify system prompt is not too long, check API key validity. 6) "Webhook not receiving events" — ensure server URL is publicly accessible (not localhost).`,
    tags: ['error', 'debug', 'troubleshoot', 'timeout', 'latency', 'audio', 'webhook', 'fix'],
  },
  {
    id: 'vapi-ngrok-local',
    category: 'Development',
    title: 'Local Development with Vapi',
    content: `For local development, your webhook server URL must be publicly accessible — Vapi cannot call localhost. Use a tunneling tool: ngrok (ngrok http 3000), Cloudflare Tunnel (cloudflared tunnel --url http://localhost:3000), or LocalTunnel. Set the resulting public URL as your server URL in the assistant config or Vapi Dashboard. Tip: use environment variables for the server URL so you can easily switch between dev and prod. For fast iteration, tools like ngrok also show the request/response in a local UI at localhost:4040.`,
    tags: ['local', 'development', 'ngrok', 'tunnel', 'localhost', 'dev', 'testing'],
  },
  {
    id: 'vapi-security',
    category: 'Security',
    title: 'API Keys and Security',
    content: `Vapi has two types of keys: 1) Public Key — safe to use in browser/frontend code. Only allows starting calls, not modifying assistants or accessing call data. 2) Private Key — server-side only. Full API access including reading call transcripts and modifying assistants. Never put the private key in browser code or commit it to git. Use environment variables (VAPI_PRIVATE_KEY server-side, NEXT_PUBLIC_VAPI_PUBLIC_KEY in browser). Webhook security: validate webhook signatures using the x-vapi-signature header against your server secret.`,
    tags: ['security', 'api key', 'private key', 'public key', 'webhook signature', 'auth'],
  },
  {
    id: 'vapi-fde-services',
    category: 'FDE Services',
    title: 'What Vapi FDE Team Offers',
    content: `The Vapi Forward-Deployed Engineering (FDE) team provides hands-on implementation support for enterprise customers. Services include: architecture review of your voice AI integration, custom assistant configuration and optimization, production readiness assessment, latency benchmarking and optimization, tool calling / webhook setup, phone number provisioning, squad design for complex routing scenarios, and training your team on Vapi best practices. Contact your FDE through this dashboard for any implementation challenges.`,
    tags: ['fde', 'forward deployed', 'support', 'services', 'enterprise', 'implementation', 'consulting'],
  },
];

export function searchKnowledgeBase(query: string, topK = 3): KBChunk[] {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = KB_CHUNKS.map((chunk) => {
    const haystack = `${chunk.title} ${chunk.content} ${chunk.tags.join(' ')}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      const count = (haystack.match(new RegExp(w, 'g')) ?? []).length;
      score += count;
    }
    if (haystack.includes(q)) score += 10;
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

export function formatKBAnswer(query: string): string {
  const results = searchKnowledgeBase(query);
  if (results.length === 0) {
    return "I don't have specific information on that topic in my knowledge base. You can find more details at docs.vapi.ai or reach out to Vapi support.";
  }
  return results.map((r) => `[${r.title}]\n${r.content}`).join('\n\n---\n\n');
}

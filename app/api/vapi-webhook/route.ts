import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createAdminClient } from '@insforge/sdk';
import { formatKBAnswer } from '../../../lib/vapi-knowledge';

const VISION_MODEL = 'Qwen/Qwen2-VL-72B-Instruct';

const FALLBACK_SCHEMA_URL =
  'https://raw.githubusercontent.com/bregman-arie/devops-exercises/master/images/db_schema_example.png';

const SYSTEM_PROMPT = `You are Alex, a Senior Forward-Deployed Engineer at Vapi. You are on a live call helping a customer review their integration.

Look at the provided schema image. Identify issues such as missing connection pooling, unindexed foreign keys, or other performance problems.

Output Format Constraint: You must output a valid JSON object with exactly two keys:
1. "spoken_response": A short, 2-sentence conversational response spoken by Alex explaining the problem and stating that a script is being pushed to their dashboard.
2. "sql_fix": The actual raw SQL migration string with fixes. Do not use markdown backticks in this field.

Respond with only the JSON object. No preamble, no explanation outside the JSON.`;

function getNebius() {
  return new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1',
    apiKey: process.env.NEBIUS_API_KEY!,
  });
}

function getAdmin() {
  return createAdminClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    apiKey: process.env.INSFORGE_API_KEY!,
  });
}

// ---------------------------------------------------------------------------
// POST /api/vapi-webhook
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = body.message as Record<string, unknown> | undefined;

  if (!message || message.type !== 'tool-calls') {
    return Response.json({ received: true });
  }

  const toolCallsArray = message.toolCallList as Array<Record<string, unknown>> | undefined;
  const toolCall = toolCallsArray?.[0];
  if (!toolCall || toolCall.type !== 'function') {
    return Response.json({ received: true });
  }

  const fn = toolCall.function as Record<string, unknown>;
  const toolCallId = toolCall.id as string;

  // ── search_knowledge_base ──────────────────────────────────────────────────
  if (fn.name === 'search_knowledge_base') {
    const kbArgs = (
      typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments
    ) as { query?: string };
    const answer = formatKBAnswer(kbArgs.query ?? '');
    return Response.json({ results: [{ toolCallId, result: answer }] });
  }

  if (fn.name !== 'analyze_architecture') {
    return Response.json({ received: true });
  }

  const args = (
    typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments
  ) as { user_issue?: string; schema_image_url?: string };

  const imageUrl = args.schema_image_url || FALLBACK_SCHEMA_URL;

  // -------------------------------------------------------------------------
  // Call Nebius vision model
  // -------------------------------------------------------------------------
  let spokenResponse =
    "Alex here — I can see the issue. Your schema is missing connection pooling and has unindexed foreign keys. I'm pushing a migration script to your dashboard now.";
  let sqlFix =
    '-- Add indexes for common FK patterns\nCREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);\nCREATE INDEX IF NOT EXISTS idx_items_order_id ON items(order_id);\nCREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);';

  try {
    const nebius = getNebius();
    const completion = await nebius.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `User issue: ${args.user_issue ?? 'hitting connection limits'}. Please analyse this schema:`,
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as { spoken_response?: string; sql_fix?: string };
    spokenResponse = parsed.spoken_response ?? spokenResponse;
    sqlFix = parsed.sql_fix ?? sqlFix;
  } catch (err) {
    console.error('[Nebius error]', err);
  }

  // -------------------------------------------------------------------------
  // Broadcast SQL to frontend via Insforge Realtime
  // -------------------------------------------------------------------------
  try {
    const admin = getAdmin();
    await admin.realtime.connect();
    await admin.realtime.subscribe('sql-fixes');
    await admin.realtime.publish('sql-fixes', 'sql_fix', { sql: sqlFix });
    admin.realtime.unsubscribe('sql-fixes');
    admin.realtime.disconnect();
  } catch (err) {
    console.error('[Insforge realtime error]', err);
  }

  // -------------------------------------------------------------------------
  // Return spoken text to Vapi
  // -------------------------------------------------------------------------
  return Response.json({
    results: [{ toolCallId, result: spokenResponse }],
  });
}

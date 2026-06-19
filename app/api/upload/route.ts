import { NextRequest } from 'next/server';
import { createAdminClient } from '@insforge/sdk';

const BUCKET = 'schema-images';

function getAdmin() {
  return createAdminClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    apiKey: process.env.INSFORGE_API_KEY!,
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const blob = file as File;

  const admin = getAdmin();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .uploadAuto(blob);

  if (error || !data) {
    console.error('[Upload error]', error);
    return Response.json({ error: error?.message ?? 'Upload failed' }, { status: 500 });
  }

  return Response.json({ url: data.url, key: data.key });
}

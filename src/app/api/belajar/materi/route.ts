import { NextResponse } from 'next/server';

import { getMateriByModul } from '~/lib/belajar/data';
import { isModulId } from '~/lib/belajar/modules';

export const dynamic = 'force-dynamic';

/** Materi (langkah) satu modul untuk semua level. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modul = searchParams.get('modul') || '';

  if (!isModulId(modul)) {
    return NextResponse.json({ error: 'modul tidak dikenal' }, { status: 400 });
  }

  const materi = await getMateriByModul(modul);
  return NextResponse.json({ modul, materi });
}

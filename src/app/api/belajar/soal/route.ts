import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getSoalSet } from '~/lib/belajar/generate';
import { isModulId } from '~/lib/belajar/modules';
import { GATE_COOKIE, verifyGate } from '~/lib/turnstile';
import type { LevelId } from '~/lib/types/belajar';

export const dynamic = 'force-dynamic';

const LEVEL_IDS: LevelId[] = ['mudah', 'sedang', 'sulit'];

export async function POST(request: Request) {
  // Hanya untuk pengunjung yang sudah lolos gate Turnstile.
  const store = await cookies();
  if (!(await verifyGate(store.get(GATE_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let modul = '';
  let level = '';
  let jumlah = 10;
  try {
    const body = (await request.json()) as {
      modul?: unknown;
      level?: unknown;
      jumlah?: unknown;
    };
    modul = String(body.modul ?? '');
    level = String(body.level ?? '');
    if (body.jumlah != null) jumlah = Number(body.jumlah);
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 });
  }

  if (!isModulId(modul) || !LEVEL_IDS.includes(level as LevelId)) {
    return NextResponse.json(
      { error: 'modul/level tidak dikenal' },
      { status: 400 }
    );
  }

  const count = Number.isFinite(jumlah)
    ? Math.min(Math.max(Math.round(jumlah), 5), 15)
    : 10;

  try {
    const set = await getSoalSet(modul, level as LevelId, count);
    return NextResponse.json(set, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Gagal membuat soal, coba lagi' },
      { status: 500 }
    );
  }
}

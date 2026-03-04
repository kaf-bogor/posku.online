import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { db } from '~/lib/firebase';

type AttendanceEventCreateInput = {
  title: unknown;
  description?: unknown;
  date: unknown;
  createdBy: unknown;
};

type AttendanceEventDTO = {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  createdBy: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function parseDateToTimestamp(date: unknown): Timestamp | null {
  if (typeof date !== 'string') return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

export const GET = async () => {
  try {
    const q = query(
      collection(db, 'attendanceEvents'),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);

    const items: AttendanceEventDTO[] = snap.docs.map((d) => {
      const data = d.data() as {
        title?: string;
        description?: string;
        date?: Timestamp;
        createdAt?: Timestamp;
        createdBy?: string;
      };

      return {
        id: d.id,
        title: data.title ?? '',
        description: data.description ?? '',
        date: data.date
          ? data.date.toDate().toISOString()
          : new Date(0).toISOString(),
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : new Date(0).toISOString(),
        createdBy: data.createdBy ?? '',
      };
    });

    return NextResponse.json(items, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch attendance events' },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as AttendanceEventCreateInput;

    if (!isNonEmptyString(body.title)) {
      return NextResponse.json(
        { message: 'title is required' },
        { status: 400 }
      );
    }

    const dateTs = parseDateToTimestamp(body.date);
    if (!dateTs) {
      return NextResponse.json(
        { message: 'date must be a valid ISO date string' },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(body.createdBy)) {
      return NextResponse.json(
        { message: 'createdBy is required' },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === 'string' ? body.description : '';

    const docRef = await addDoc(collection(db, 'attendanceEvents'), {
      title: body.title.trim(),
      description,
      date: dateTs,
      createdAt: serverTimestamp(),
      createdBy: body.createdBy.trim(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to create attendance event' },
      { status: 500 }
    );
  }
};

import {
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { db } from '~/lib/firebase';

const COLLECTION = 'attendanceEvents';
const MSG_ID_REQUIRED = 'id is required';
const MSG_NOT_FOUND = 'Not found';

type AttendanceEventUpdateInput = {
  title?: unknown;
  description?: unknown;
  date?: unknown;
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

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: MSG_ID_REQUIRED }, { status: 400 });
    }

    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ message: MSG_NOT_FOUND }, { status: 404 });
    }

    const data = snap.data() as {
      title?: string;
      description?: string;
      date?: Timestamp;
      createdAt?: Timestamp;
      createdBy?: string;
    };

    return NextResponse.json(
      {
        id: snap.id,
        title: data.title ?? '',
        description: data.description ?? '',
        date: data.date
          ? data.date.toDate().toISOString()
          : new Date(0).toISOString(),
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : new Date(0).toISOString(),
        createdBy: data.createdBy ?? '',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch attendance event' },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: MSG_ID_REQUIRED }, { status: 400 });
    }

    const body = (await req.json()) as AttendanceEventUpdateInput;

    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (body.title !== undefined) {
      if (!isNonEmptyString(body.title)) {
        return NextResponse.json(
          { message: 'title must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json(
          { message: 'description must be a string' },
          { status: 400 }
        );
      }
      updates.description = body.description;
    }

    if (body.date !== undefined) {
      const dateTs = parseDateToTimestamp(body.date);
      if (!dateTs) {
        return NextResponse.json(
          { message: 'date must be a valid ISO date string' },
          { status: 400 }
        );
      }
      updates.date = dateTs;
    }

    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ message: MSG_NOT_FOUND }, { status: 404 });
    }

    await updateDoc(ref, updates);

    return NextResponse.json({ id }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to update attendance event' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: MSG_ID_REQUIRED }, { status: 400 });
    }

    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ message: MSG_NOT_FOUND }, { status: 404 });
    }

    await deleteDoc(ref);

    return NextResponse.json({ id }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete attendance event' },
      { status: 500 }
    );
  }
};

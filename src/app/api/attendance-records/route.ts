import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  addDoc,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { db } from '~/lib/firebase';

const EVENTS_COLLECTION = 'attendanceEvents';
const RECORDS_COLLECTION = 'attendanceRecords';

type CheckInInput = {
  eventId: unknown;
  userEmail: unknown;
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as CheckInInput;

    if (typeof body.eventId !== 'string' || !body.eventId.trim()) {
      return NextResponse.json(
        { message: 'eventId is required' },
        { status: 400 }
      );
    }

    if (typeof body.userEmail !== 'string' || !body.userEmail.trim()) {
      return NextResponse.json(
        { message: 'userEmail is required' },
        { status: 400 }
      );
    }

    const eventId = body.eventId.trim();
    const userEmail = body.userEmail.trim();

    // Validate event exists
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) {
      return NextResponse.json(
        { message: 'Event tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check duplicate check-in
    const duplicateQuery = query(
      collection(db, RECORDS_COLLECTION),
      where('eventId', '==', eventId),
      where('userEmail', '==', userEmail)
    );
    const duplicateSnap = await getDocs(duplicateQuery);
    if (!duplicateSnap.empty) {
      return NextResponse.json(
        { message: 'Anda sudah check-in untuk event ini' },
        { status: 409 }
      );
    }

    // Create attendance record
    const docRef = await addDoc(collection(db, RECORDS_COLLECTION), {
      eventId,
      userEmail,
      checkedInAt: serverTimestamp(),
    });

    return NextResponse.json(
      { id: docRef.id, message: 'Check-in berhasil!' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Gagal melakukan check-in' },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { message: 'eventId query param is required' },
        { status: 400 }
      );
    }

    const q = query(
      collection(db, RECORDS_COLLECTION),
      where('eventId', '==', eventId)
    );
    const snap = await getDocs(q);

    const records = snap.docs.map((d) => {
      const data = d.data() as {
        eventId?: string;
        userEmail?: string;
        checkedInAt?: { toDate: () => Date };
      };

      return {
        id: d.id,
        eventId: data.eventId ?? '',
        userEmail: data.userEmail ?? '',
        checkedInAt: data.checkedInAt
          ? data.checkedInAt.toDate().toISOString()
          : new Date(0).toISOString(),
      };
    });

    return NextResponse.json(records, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Gagal mengambil data kehadiran' },
      { status: 500 }
    );
  }
};

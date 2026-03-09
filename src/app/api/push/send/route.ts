import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

import { db } from '~/lib/firebase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      url = '/',
    } = body as { title: string; message: string; url?: string };

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      );
    }

    const snapshot = await getDocs(collection(db, 'push_subscriptions'));
    const payload = JSON.stringify({ title, body: message, url });

    const results = await Promise.allSettled(
      snapshot.docs.map((document) => {
        const { subscription } = document.data() as {
          subscription: webpush.PushSubscription;
        };
        return webpush.sendNotification(subscription, payload);
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

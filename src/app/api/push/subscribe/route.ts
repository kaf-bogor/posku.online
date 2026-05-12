import { collection, doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { db } from '~/lib/firebase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription } = body as { subscription: PushSubscriptionJSON };

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    const id = Buffer.from(subscription.endpoint).toString('base64').slice(-32);
    await setDoc(doc(collection(db, 'push_subscriptions'), id), {
      subscription,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

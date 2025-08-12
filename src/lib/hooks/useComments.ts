import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '~/lib/firebase';
import type { CommentItem } from '~/lib/types/comment';

interface UseCommentsOptions {
  resourceType: string;
  resourceId: string;
}

interface AddCommentParams {
  userId: string;
  userName: string;
  userPhotoURL?: string;
  comment: string;
}

export function useComments({ resourceType, resourceId }: UseCommentsOptions) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceType || !resourceId) return undefined;

    const q = query(
      collection(db, 'comments'),
      where('resourceType', '==', resourceType),
      where('resourceId', '==', resourceId),
      orderBy('createdAtTs', 'asc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: CommentItem[] = snap.docs.map((d) => {
          const data = d.data() as {
            resourceType: string;
            resourceId: string;
            userId: string;
            userName: string;
            userPhotoURL?: string | null;
            comment: string;
            createdAt?: string;
            createdAtTs?: Timestamp;
          };

          let createdAtStr = new Date().toISOString();
          if (data.createdAt) {
            createdAtStr = data.createdAt;
          } else if (data.createdAtTs) {
            createdAtStr = data.createdAtTs.toDate().toISOString();
          }

          return {
            id: d.id,
            resourceType: data.resourceType,
            resourceId: data.resourceId,
            userId: data.userId,
            userName: data.userName,
            userPhotoURL: data.userPhotoURL ?? undefined,
            comment: data.comment,
            createdAt: createdAtStr,
          };
        });
        setComments(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [resourceType, resourceId]);

  const addComment = useCallback(
    async ({ userId, userName, userPhotoURL, comment }: AddCommentParams) => {
      if (!comment.trim()) return;
      await addDoc(collection(db, 'comments'), {
        resourceType,
        resourceId,
        userId,
        userName,
        userPhotoURL: userPhotoURL || null,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        createdAtTs: serverTimestamp(),
      });
    },
    [resourceType, resourceId]
  );

  return { comments, loading, error, addComment };
}

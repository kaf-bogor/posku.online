import { useCallback, useEffect, useState } from 'react';

import { addComment, listComments } from '~/lib/services/commentsService';
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

  const load = useCallback(async () => {
    if (!resourceType || !resourceId) return;
    try {
      const items = await listComments(resourceType, resourceId);
      setComments(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat komentar');
    } finally {
      setLoading(false);
    }
  }, [resourceType, resourceId]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const addCommentFn = useCallback(
    async ({ userPhotoURL, comment }: AddCommentParams) => {
      if (!comment.trim()) return;
      await addComment({
        resourceType,
        resourceId,
        userPhotoURL: userPhotoURL || undefined,
        comment: comment.trim(),
      });
      load();
    },
    [resourceType, resourceId, load]
  );

  return { comments, loading, error, addComment: addCommentFn };
}

export interface CommentItem {
  id: string;
  resourceType: string; // e.g., 'news', 'events', etc.
  resourceId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  comment: string;
  createdAt: string; // ISO string for client display
}

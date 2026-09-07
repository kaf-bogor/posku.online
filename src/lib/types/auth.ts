export type AuthUser = {
  email: string;
  name: string;
  displayName: string;
  photoURL: string | null;
  uid: string;
  admin: boolean;
};

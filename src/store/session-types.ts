/** Mirrors `/api/auth/me` user payload for client-side session state. */
export interface SessionUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  locale?: string | null;
}

import { ok } from '@/lib/api-helpers';
import { clearSessionCookie } from '@/lib/auth';
export const dynamic = 'force-dynamic';


export async function POST() {
  await clearSessionCookie();
  return ok({ loggedOut: true });
}

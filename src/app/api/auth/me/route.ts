import { ok, bad, safe } from '@/lib/api-helpers';
import { getCurrentUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';


export async function GET() {
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'You are not signed in.');
    return ok({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name ?? null,
        email: user.email ?? null,
        role: user.role,
        locale: user.locale,
      },
    });
  });
}

/** Fast OTP testing on LAN / mobile (dev server only). */
export const DEV_FAST_OTP =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_FAST_OTP === 'true';

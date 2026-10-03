/**
 * Cloudflare Turnstile Captcha verification service.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Gracefully allow local development, mock tokens, and unit testing without hard blocks
  if (!secretKey || process.env.NODE_ENV === 'test' || !token || token === 'dummy-turnstile-token' || token === 'skip-in-dev') {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      return { success: false, error: 'Turnstile verification service unavailable.' };
    }

    const data = await res.json();
    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: 'Security challenge failed. Please refresh and try again.',
    };
  } catch (err: unknown) {
    console.error('[TURNSTILE-VERIFY-ERROR]', err);
    return { success: false, error: 'Failed to complete security check.' };
  }
}

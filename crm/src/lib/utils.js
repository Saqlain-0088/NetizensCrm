import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function verifyAuth(request) {
  const sessionCookie = request.cookies.get('crm_session');

  if (!sessionCookie || !sessionCookie.value) {
    return { error: 'Unauthorized' };
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return { user };
  } catch (e) {
    return { error: 'Invalid session' };
  }
}

import { Resend } from 'resend';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(payload: Partial<ContactPayload>): string | null {
  if (!payload.name || !payload.name.trim()) return 'Name is required.';
  if (!payload.email || !isValidEmail(payload.email)) return 'A valid email is required.';
  if (!payload.message || !payload.message.trim()) return 'Message is required.';
  return null;
}

export async function POST(request: Request): Promise<Response> {
  let payload: Partial<ContactPayload>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null) {
      return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    payload = parsed as Partial<ContactPayload>;
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const validationError = validate(payload);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'Portfolio Contact Form <onboarding@resend.dev>',
    to: process.env.CONTACT_TO_EMAIL as string,
    replyTo: payload.email,
    subject: `New message from ${payload.name}`,
    text: payload.message as string,
  });

  if (error) {
    return Response.json({ error: 'Failed to send message.' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}

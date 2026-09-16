import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: sendMock } };
  }),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
  });

  it('returns 400 when required fields are missing', async () => {
    const response = await POST(makeRequest({ name: '', email: '', message: '' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when the email is invalid', async () => {
    const response = await POST(makeRequest({ name: 'A', email: 'not-an-email', message: 'hi' }));
    expect(response.status).toBe(400);
  });

  it('sends the email and returns 200 for valid input', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const response = await POST(
      makeRequest({ name: 'Jane', email: 'jane@example.com', message: 'Hello there' })
    );
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@example.com',
      })
    );
    expect(response.status).toBe(200);
  });

  it('returns 500 when the email provider fails', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const response = await POST(
      makeRequest({ name: 'Jane', email: 'jane@example.com', message: 'Hello there' })
    );
    expect(response.status).toBe(500);
  });

  it('returns 400 when the body is not valid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        body: '{not json',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when the body is valid JSON but not an object', async () => {
    const response = await POST(makeRequest(null));
    expect(response.status).toBe(400);
  });
});

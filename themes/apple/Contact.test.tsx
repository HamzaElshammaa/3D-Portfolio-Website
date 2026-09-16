import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppleContact } from './Contact';

const contact = {
  email: 'owner@example.com',
  calendlyUrl: 'https://calendly.com/example',
  socials: [{ label: 'GitHub', url: 'https://github.com/example' }],
};

describe('AppleContact', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  it('renders direct email, calendly, and social links', () => {
    render(<AppleContact contact={contact} />);
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:owner@example.com'
    );
    expect(screen.getByRole('link', { name: /book a call/i })).toHaveAttribute(
      'href',
      'https://calendly.com/example'
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/example'
    );
  });

  it('submits the form to /api/contact and shows a success message', async () => {
    const user = userEvent.setup();
    render(<AppleContact contact={contact} />);
    await user.type(screen.getByLabelText(/name/i), 'Jane');
    await user.type(screen.getByLabelText(/^email$/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello there');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' })
    );
    await waitFor(() => expect(screen.getByText(/thanks/i)).toBeInTheDocument());
  });

  it('shows an error and re-enables the button when the network request rejects', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(<AppleContact contact={contact} />);
    await user.type(screen.getByLabelText(/name/i), 'Jane');
    await user.type(screen.getByLabelText(/^email$/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello there');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled();
  });
});

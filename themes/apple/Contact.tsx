'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SiteContent } from '@/content/site-content';

export function AppleContact({ contact }: { contact: SiteContent['contact'] }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setStatus(response.ok ? 'sent' : 'error');
      if (response.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="w-full bg-white px-6 py-24">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-[#1D1D1F]" htmlFor="name">
            Name
            <input id="name" name="name" required className="rounded-lg border border-[#E5E5EA] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#1D1D1F]" htmlFor="email">
            Email
            <input id="email" name="email" type="email" required className="rounded-lg border border-[#E5E5EA] px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#1D1D1F]" htmlFor="message">
            Message
            <textarea id="message" name="message" required rows={4} className="rounded-lg border border-[#E5E5EA] px-3 py-2" />
          </label>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-full bg-[#0071E3] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Send message
          </button>
          {status === 'sent' && <p className="text-sm text-green-600">Thanks — I&apos;ll get back to you soon.</p>}
          {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
        </form>
        <div className="flex flex-col gap-3 text-sm text-[#1D1D1F]">
          <a href={`mailto:${contact.email}`} className="hover:text-[#0071E3]">
            Email me directly
          </a>
          <a
            href={contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0071E3]"
          >
            Book a call
          </a>
          {contact.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0071E3]"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

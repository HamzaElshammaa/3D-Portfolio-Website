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
    <section id="contact" className="w-full border-t border-white/10 bg-[#000000] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0071E3]">
            Initiate Project
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Get in touch.
          </h2>
          <p className="mt-3 text-sm text-[#86868B]">
            Have an upcoming build, contract, or product launch? Let&apos;s talk.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#161617] p-8 shadow-xl"
          >
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-300" htmlFor="name">
              Name
              <input
                id="name"
                name="name"
                required
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#0071E3] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-300" htmlFor="email">
              Email
              <input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#0071E3] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-300" htmlFor="message">
              Message
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#0071E3] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
              />
            </label>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#0077ED] disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send message'}
            </button>
            {status === 'sent' && (
              <p className="text-center text-xs font-medium text-emerald-400">
                Thanks — I&apos;ll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="text-center text-xs font-medium text-rose-400">
                Something went wrong. Please try again.
              </p>
            )}
          </form>

          {/* Quick Direct Links */}
          <div className="flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-4">
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#161617] p-6 shadow-xl transition-all hover:border-white/20"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#86868B]">Direct Contact</p>
                  <p className="mt-1 text-base font-medium text-white group-hover:text-blue-400 transition-colors">
                    Email me directly
                  </p>
                  <p className="text-xs text-[#86868B]">{contact.email}</p>
                </div>
                <span className="text-lg text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:text-white" aria-hidden="true">
                  &rarr;
                </span>
              </a>

              <a
                href={contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#161617] p-6 shadow-xl transition-all hover:border-white/20"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#86868B]">Calendar</p>
                  <p className="mt-1 text-base font-medium text-white group-hover:text-blue-400 transition-colors">
                    Book a call
                  </p>
                  <p className="text-xs text-[#86868B]">Schedule a 15-30 min intro session</p>
                </div>
                <span className="text-lg text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:text-white" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#161617] p-6 shadow-xl">
              <p className="text-xs uppercase tracking-wider text-[#86868B]">Social Profiles</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {contact.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

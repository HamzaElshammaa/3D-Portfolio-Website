import type { NavLink } from '@/content/site-content';

export function AppleNav({ wordmark, links }: { wordmark: string; links: NavLink[] }) {
  return (
    <nav className="fixed top-0 z-40 w-full border-b border-white/10 bg-[#000000]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold tracking-tight text-white">{wordmark}</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-300">
            Pro
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-normal tracking-tight text-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full bg-[#0071E3] px-3.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            Connect
          </a>
        </div>
      </div>
    </nav>
  );
}

export function AppleFooter({
  socials,
  copyrightNotice,
}: {
  socials: { label: string; url: string }[];
  copyrightNotice: string;
}) {
  return (
    <footer className="w-full border-t border-white/10 bg-[#000000] px-6 py-12 text-xs text-[#86868B]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="order-2 sm:order-1">&copy; {new Date().getFullYear()} {copyrightNotice}</p>
        <div className="order-1 flex items-center gap-6 sm:order-2">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 transition-colors hover:text-white"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

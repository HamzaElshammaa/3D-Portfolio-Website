import type { NavLink } from '@/content/site-content';

export function AppleNav({ wordmark, links }: { wordmark: string; links: NavLink[] }) {
  return (
    <nav className="fixed top-0 z-40 flex w-full items-center justify-between bg-white/70 px-8 py-4 backdrop-blur-md">
      <span className="font-semibold text-[#1D1D1F]">{wordmark}</span>
      <div className="flex gap-6">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="text-sm text-[#1D1D1F] hover:text-[#0071E3]">
            {link.label}
          </a>
        ))}
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
    <footer className="flex w-full flex-col items-center gap-4 border-t border-[#E5E5EA] bg-white py-10 text-sm text-[#6E6E73]">
      <div className="flex gap-4">
        {socials.map((social) => (
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
      <p>&copy; {new Date().getFullYear()} {copyrightNotice}</p>
    </footer>
  );
}

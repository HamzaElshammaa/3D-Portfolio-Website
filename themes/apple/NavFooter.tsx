const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

export function AppleNav() {
  return (
    <nav className="fixed top-0 z-40 flex w-full items-center justify-between bg-white/70 px-8 py-4 backdrop-blur-md">
      <span className="font-semibold text-[#1D1D1F]">Portfolio</span>
      <div className="flex gap-6">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="text-sm text-[#1D1D1F] hover:text-[#0071E3]">
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function AppleFooter({ socials }: { socials: { label: string; url: string }[] }) {
  return (
    <footer className="flex w-full flex-col items-center gap-4 border-t border-[#E5E5EA] bg-white py-10 text-sm text-[#6E6E73]">
      <div className="flex gap-4">
        {socials.map((social) => (
          <a key={social.label} href={social.url} className="hover:text-[#0071E3]">
            {social.label}
          </a>
        ))}
      </div>
      <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
    </footer>
  );
}

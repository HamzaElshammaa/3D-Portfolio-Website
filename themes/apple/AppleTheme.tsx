import { content } from '@/content/site-content';
import { AppleNav, AppleFooter } from './NavFooter';
import { AppleHero } from './Hero';
import { AppleWork } from './Work';
import { AppleAboutServices } from './AboutServices';
import { AppleTestimonials } from './Testimonials';
import { AppleContact } from './Contact';

export function AppleTheme() {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-white antialiased selection:bg-[#0071E3] selection:text-white">
      <AppleNav wordmark={content.site.wordmark} links={content.nav} />
      <AppleHero hero={content.hero} />
      <AppleWork projects={content.projects} heading={content.workHeading} />
      <AppleAboutServices
        about={content.about}
        servicesHeading={content.servicesHeading}
        services={content.services}
      />
      <AppleTestimonials testimonials={content.testimonials} />
      <AppleContact contact={content.contact} />
      <AppleFooter socials={content.contact.socials} copyrightNotice={content.site.copyrightNotice} />
    </div>
  );
}

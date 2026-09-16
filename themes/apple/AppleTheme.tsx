import { content } from '@/content/site-content';
import { AppleNav, AppleFooter } from './NavFooter';
import { AppleHero } from './Hero';
import { AppleWork } from './Work';
import { AppleAboutServices } from './AboutServices';
import { AppleTestimonials } from './Testimonials';
import { AppleContact } from './Contact';

export function AppleTheme() {
  return (
    <div className="w-full">
      <AppleNav />
      <AppleHero hero={content.hero} />
      <AppleWork projects={content.projects} />
      <AppleAboutServices about={content.about} services={content.services} />
      <AppleTestimonials testimonials={content.testimonials} />
      <AppleContact contact={content.contact} />
      <AppleFooter socials={content.contact.socials} />
    </div>
  );
}

import type { Locale } from "./content";

export interface Testimonial {
  name: string;
  company: string;
  /** path under /public, e.g. "/images/testimonials/sara.jpg" */
  photo: string;
  /** company logo under /public, e.g. "/images/testimonials/acme.svg" */
  logo?: string;
  /** optional voice note under /public, e.g. "/audio/sara.mp3" */
  audio?: string;
  role: Record<Locale, string>;
  quote: Record<Locale, string>;
  /** sample content: shown in development only, never in a production build */
  placeholder?: boolean;
}

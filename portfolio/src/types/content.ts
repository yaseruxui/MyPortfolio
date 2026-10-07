export type Locale = "ar" | "en";

export const LOCALES: readonly Locale[] = ["ar", "en"] as const;
export const DEFAULT_LOCALE: Locale = "ar";

export type ProjectType = "app" | "web" | "brand";

export interface CaseStudyContent {
  tagline: string;
  role: string;
  tools: string;
  team: string;
  overview: string;
}

export interface ProjectSummary {
  category: string;
  summary: string;
}

export interface Project {
  slug: string;
  type: ProjectType;
  title: string;
  year: number;
  link: string;
  /** optional app-store links; a button renders only for the ones set */
  stores?: {
    appStore?: string;
    googlePlay?: string;
  };
  images: {
    cover: string;
    /** dark site cover used on the home work section and /work grid
        (rendered by scripts/render-covers.mjs; falls back to cover) */
    thumb?: string;
    /** optional larger image for the home showcase cards (falls back to cover) */
    card?: string;
    /** CSS object-position for the card image, e.g. "top" for tall images */
    cardPosition?: string;
    gallery?: string[];
  };
  /** present on full case-study projects */
  study?: Record<Locale, CaseStudyContent>;
  /** present on lighter "summary only" projects */
  ar?: ProjectSummary;
  en?: ProjectSummary;
}

export interface SiteContent {
  portrait: string;
  email: string;
  whatsapp: string;
  cv: string;
  social: {
    behance: string;
    dribbble: string;
    linkedin: string;
  };
  stats: number[];
}

export interface CvExperience {
  date: string;
  role: string;
  org: string;
  desc: string;
  /** company logo under /public, e.g. "images/companies/apex.svg"; "icon:freelance"
      shows a neutral briefcase; omitted = monogram of the org name */
  logo?: string;
}
export interface CvEducation {
  date: string;
  title: string;
  org: string;
  desc: string;
}
export interface CvCourse {
  n: string;
  h: number;
  org: string;
}
/* Contact details are deliberately not stored here: they are third-party
   personal data and are shared on request only. */
export interface CvReference {
  name: string;
  role: string;
}
export interface CvLocaleContent {
  name: string;
  role: string;
  tagline: string;
  download: string;
  back: string;
  location: string;
  sections: {
    experience: string;
    skills: string;
    education: string;
    courses: string;
    references: string;
    tools: string;
    ai: string;
    personal: string;
  };
  experience: CvExperience[];
  technical: string[];
  /** tool/brand names — same in both languages */
  tools: string[];
  aiTools: string[];
  personal: string[];
  education: CvEducation[];
  courses: CvCourse[];
  refNote: string;
  references: CvReference[];
}
export type CvContent = Record<Locale, CvLocaleContent>;

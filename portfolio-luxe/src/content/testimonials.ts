import type { Testimonial } from "@/types/extras";
import data from "./testimonials.json";

/* Placeholder testimonials are for previewing the layout locally; they are
   dropped from production builds so sample quotes never go live. */
export const TESTIMONIALS = (data as Testimonial[]).filter(
  (t) => !t.placeholder || process.env.NODE_ENV !== "production",
);

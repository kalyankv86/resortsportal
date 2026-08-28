import type { StatItem } from "@/components/ui/Stat";
import type { MediaCategory } from "@/lib/media";

export const heroContent = {
  eyebrow: "Centurion Wellness Eco Tourism",
  headline: "Reconnect with Yourself.",
  subtitle: ["Ancient Ayurveda.", "Forest Healing.", "Sustainable Luxury."],
  primaryCta: { label: "Book Wellness Stay", href: "/book-now" },
  secondaryCta: { label: "Explore Retreats", href: "/wellness-programs" },
  tertiaryCta: { label: "Virtual Tour", href: "/virtual-tour" },
};

export const stats: StatItem[] = [
  { value: 50, suffix: "+", label: "Ayurvedic Therapies" },
  { value: 64, label: "Rooms & Villas" },
  { value: 18, label: "Doctors & Therapists" },
  { value: 120, label: "Acres of Forest" },
  { value: 40, label: "Acre Organic Farm" },
];

export interface BentoItem {
  title: string;
  copy: string;
  href: string;
  category: MediaCategory;
  span: "sm" | "md" | "lg" | "tall";
  cta: string;
}

export const bento: BentoItem[] = [
  {
    title: "Wellness Packages",
    copy: "Residential retreats from 3 to 21 nights — detox, de-stress, immunity, rejuvenation.",
    href: "/wellness-packages",
    category: "ayurveda",
    span: "lg",
    cta: "View programmes",
  },
  {
    title: "Luxury Stay",
    copy: "Forest Deluxe rooms, Bamboo Villas and Lake Cottages, each with a private verandah.",
    href: "/luxury-stay",
    category: "rooms",
    span: "tall",
    cta: "See accommodation",
  },
  {
    title: "Farm-to-Table Dining",
    copy: "Millet kitchen, herbal tea lounge and a diet prescribed by your Ayurvedic doctor.",
    href: "/dining",
    category: "dining",
    span: "md",
    cta: "Explore dining",
  },
  {
    title: "Eco Tourism",
    copy: "Waterfall treks, bird watching, village tourism, bamboo craft and star gazing.",
    href: "/eco-tourism",
    category: "forest",
    span: "md",
    cta: "Plan experiences",
  },
  {
    title: "Daily Practice",
    copy: "Guided sunrise yoga, pranayama and a forest sound-bath — open to resident guests.",
    href: "/yoga",
    category: "yoga",
    span: "sm",
    cta: "Yoga & meditation",
  },
  {
    title: "Find your programme",
    copy: "Answer a short dosha questionnaire and our advisors suggest a retreat, therapies and a daily rhythm.",
    href: "/wellness-programs",
    category: "meditation",
    span: "sm",
    cta: "Start questionnaire",
  },
];

export interface Experience {
  name: string;
  duration: string;
  category: MediaCategory;
  href: string;
}

export const experiences: Experience[] = [
  { name: "Waterfall Trek", duration: "Half day", category: "waterfalls", href: "/experiences" },
  { name: "Forest Sound Bath", duration: "90 min", category: "forest", href: "/meditation" },
  { name: "Organic Farm Walk", duration: "2 hours", category: "organic-farm", href: "/experiences" },
  { name: "Sunrise Yoga Deck", duration: "60 min", category: "yoga", href: "/yoga" },
  { name: "Bamboo Craft Studio", duration: "2 hours", category: "events", href: "/experiences" },
  { name: "Star Gazing Meadow", duration: "Evening", category: "drone", href: "/experiences" },
];

export interface Review {
  quote: string;
  name: string;
  origin: string;
  rating: number;
}

export const reviews: Review[] = [
  {
    quote:
      "Fifteen days of Panchakarma and I left lighter in every sense. The forest does half the healing.",
    name: "Ananya R.",
    origin: "Bengaluru",
    rating: 5,
  },
  {
    quote:
      "The most thoughtfully run wellness centre I have visited in India. Doctors who actually listen.",
    name: "Michael T.",
    origin: "Melbourne",
    rating: 5,
  },
  {
    quote:
      "Our corporate cohort came for a digital detox and went home a team. Food was extraordinary.",
    name: "Priya S.",
    origin: "Hyderabad",
    rating: 5,
  },
];

/** Global site configuration + primary navigation (full IA from the brief). */

export const site = {
  name: "Centurion Wellness Eco Tourism",
  shortName: "Centurion Wellness",
  org: "Centurion University of Technology and Management",
  tagline: "Heal • Stay • Reconnect with Nature",
  url: "https://wellness.cutm.ac.in",
  phone: "+91 90000 00000",
  email: "wellness@cutm.ac.in",
  address: "Centurion University, Paralakhemundi, Gajapati, Odisha 761211",
  campus: "Paralakhemundi Campus · foothills of the Eastern Ghats",
  socials: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export interface NavNode {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const primaryNav: NavNode[] = [
  {
    label: "Wellness",
    href: "/ayurveda-wellness-centre",
    children: [
      { label: "Ayurveda Wellness Centre", href: "/ayurveda-wellness-centre" },
      { label: "Wellness Programs", href: "/wellness-programs" },
      { label: "Panchakarma Treatments", href: "/panchakarma-treatments" },
      { label: "Therapies", href: "/therapies" },
      { label: "Doctors & Therapists", href: "/doctors-therapists" },
      { label: "Wellness Packages", href: "/wellness-packages" },
    ],
  },
  {
    label: "Stay",
    href: "/luxury-stay",
    children: [
      { label: "Wellness Stay", href: "/luxury-stay" },
      { label: "Rooms", href: "/rooms" },
      { label: "Villas", href: "/villas" },
      { label: "Eco Cottages", href: "/eco-cottages" },
    ],
  },
  {
    label: "Dining",
    href: "/dining",
    children: [
      { label: "Dining", href: "/dining" },
      { label: "Organic Café", href: "/organic-cafe" },
      { label: "Wellness Kitchen", href: "/wellness-kitchen" },
    ],
  },
  {
    label: "Eco Tourism",
    href: "/eco-tourism",
    children: [
      { label: "Eco Tourism", href: "/eco-tourism" },
      { label: "Nature Trails", href: "/nature-trails" },
      { label: "Experiences", href: "/experiences" },
      { label: "Yoga", href: "/yoga" },
      { label: "Meditation", href: "/meditation" },
      { label: "Retreat Calendar", href: "/retreat-calendar" },
    ],
  },
  {
    label: "Explore Gajapati",
    href: "/explore-gajapati",
    children: [
      { label: "Explore Gajapati", href: "/explore-gajapati" },
      { label: "Mahendragiri Hills", href: "/explore-gajapati/mahendragiri-hills" },
      { label: "Gandahati Waterfall", href: "/explore-gajapati/gandahati-waterfall" },
      { label: "Gajapati Palace", href: "/explore-gajapati/gajapati-palace" },
      { label: "Padmasambhava Mahavihara", href: "/explore-gajapati/padmasambhava-mahavihara" },
      { label: "Saura Tribal Villages", href: "/explore-gajapati/saura-villages" },
      { label: "Campus Experiences", href: "/campus-experiences" },
    ],
  },
  {
    label: "Discover",
    href: "/gallery",
    children: [
      { label: "Gallery", href: "/gallery" },
      { label: "Virtual Tour", href: "/virtual-tour" },
      { label: "Events", href: "/events" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Blog", href: "/blog" },
      { label: "About Centurion Wellness", href: "/about" },
      { label: "About Centurion University", href: "/about-university" },
    ],
  },
];

export const utilityNav = [
  { label: "Corporate Retreats", href: "/corporate-retreats" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "Membership", href: "/membership" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

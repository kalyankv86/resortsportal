/** Global site configuration + primary navigation (full IA from the brief). */

export const site = {
  name: "Centurion Wellness Eco Tourism",
  shortName: "Centurion Wellness",
  org: "Centurion University of Technology and Management",
  tagline: "Heal • Stay • Reconnect with Nature",
  url: "https://wellness.cutm.ac.in",
  phone: "+91 63717 45061",
  email: "prasant.panda@cutm.ac.in",
  contactName: "Prasanth Panda",
  address:
    "Village Alluri Nagar, P.O. – R Sitapur, Via – Uppalada, Paralakhemundi, Gajapati, Odisha, India – 761211",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Centurion+University+of+Technology+and+Management%2C+Paralakhemundi",
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
    label: "About Us",
    href: "/about-university",
    children: [
      { label: "About Centurion Wellness", href: "/about" },
      { label: "About Centurion University", href: "/about-university" },
    ],
  },
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
    label: "Stay & Experiences",
    href: "/luxury-stay",
    children: [
      { label: "Rooms, Villas & Cottages", href: "/luxury-stay" },
      { label: "Dining", href: "/dining" },
      { label: "Organic Café", href: "/organic-cafe" },
      { label: "Wellness Kitchen", href: "/wellness-kitchen" },
      { label: "Eco Tourism", href: "/eco-tourism" },
      { label: "Nature Trails", href: "/nature-trails" },
      { label: "Yoga", href: "/yoga" },
      { label: "Meditation", href: "/meditation" },
    ],
  },
  {
    label: "Sightseeing",
    href: "/sightseeing",
    children: [
      { label: "All Sightseeing", href: "/sightseeing" },
      { label: "Mahendragiri Hills", href: "/sightseeing/mahendragiri-hills" },
      { label: "Gandahati Waterfall", href: "/sightseeing/gandahati-waterfall" },
      { label: "Gajapati Palace", href: "/sightseeing/gajapati-palace" },
      { label: "Padmasambhava Mahavihara", href: "/sightseeing/padmasambhava-mahavihara" },
      { label: "Taptapani Hot Spring", href: "/sightseeing/taptapani" },
      { label: "Saura Tribal Villages", href: "/sightseeing/saura-villages" },
      { label: "Mahendratanaya River", href: "/sightseeing/mahendratanaya-river" },
    ],
  },
  {
    label: "Campus Experience",
    href: "/campus-experiences",
  },
  {
    label: "Discover",
    href: "/gallery",
    children: [
      { label: "Gallery", href: "/gallery" },
      { label: "Virtual Tour", href: "/virtual-tour" },
      { label: "Events", href: "/events" },
      { label: "Testimonials", href: "/testimonials" },
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

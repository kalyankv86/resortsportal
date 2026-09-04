/** Global site configuration + primary navigation (full IA from the brief). */

export const site = {
  name: "Centurion Wellness & Eco Tourism",
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
    instagram: "https://www.instagram.com/cuwellnessonline",
    facebook: "https://www.facebook.com/profile.php?id=61593676091408",
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
      { label: "Wellness Stay", href: "/luxury-stay" },
      { label: "Dining", href: "/dining" },
      { label: "Eco Tourism", href: "/eco-tourism" },
      { label: "Yoga", href: "/yoga" },
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
      { label: "Taptapani Hot Spring", href: "/sightseeing/taptapani" },
      { label: "Saura Tribal Villages", href: "/sightseeing/saura-villages" },
      { label: "Mahendratanaya River", href: "/sightseeing/mahendratanaya-river" },
    ],
  },
  {
    label: "Campus Experience",
    href: "/campus-experiences",
  },
];

export const utilityNav = [
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

/** Footer link columns — curated, not derived from the main menu. */
export const footerNav: { label: string; children: { label: string; href: string }[] }[] = [
  {
    label: "About",
    children: [
      { label: "About Centurion Wellness", href: "/about" },
      { label: "About Centurion University", href: "/about-university" },
      { label: "Campus Experience", href: "/campus-experiences" },
    ],
  },
  {
    label: "Wellness",
    children: [
      { label: "Ayurveda Wellness Centre", href: "/ayurveda-wellness-centre" },
      { label: "Wellness Programs", href: "/wellness-programs" },
      { label: "Panchakarma Treatments", href: "/panchakarma-treatments" },
      { label: "Therapies", href: "/therapies" },
      { label: "Wellness Packages", href: "/wellness-packages" },
    ],
  },
  {
    label: "Stay & Dining",
    children: [
      { label: "Wellness Stay", href: "/luxury-stay" },
      { label: "Dining", href: "/dining" },
      { label: "Sightseeing", href: "/sightseeing" },
    ],
  },
];

import type { MediaCategory } from "@/lib/media";

/* =============================================================================
 * CWETR marketing-page registry.
 *
 * Every route in the information architecture (except Home) is described here as
 * data and rendered by <StandardPage>. Pages that later need bespoke behaviour
 * get promoted to their own route file — Next.js matches static routes before
 * the [slug] catch-all, so no registry change is needed to override one.
 * ===========================================================================*/

export type Section =
  | { kind: "intro"; heading?: string; body: string[] }
  | { kind: "features"; heading: string; body?: string; items: Feature[] }
  | { kind: "cards"; heading: string; body?: string; category: MediaCategory; items: Card[] }
  | { kind: "gallery"; heading: string; body?: string; category: MediaCategory }
  | { kind: "stats"; heading?: string; items: { value: number; suffix?: string; label: string }[] }
  | { kind: "steps"; heading: string; body?: string; items: { title: string; text: string }[] }
  | { kind: "pricing"; heading: string; body?: string; items: Plan[] }
  | { kind: "faq"; heading: string; items: { q: string; a: string }[] }
  | { kind: "contact"; heading: string }
  | { kind: "booking"; heading: string; body?: string }
  | { kind: "login"; heading: string }
  | { kind: "cta"; heading: string; body: string; primary: Link; secondary?: Link };

export interface Feature { title: string; text: string }
export interface Card { title: string; text: string; href?: string; photo?: string }
export interface Link { label: string; href: string }
export interface Plan {
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  href: string;
  featured?: boolean;
}

export interface PageDef {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  hero: MediaCategory;
  parent?: { label: string; href: string };
  sections: Section[];
}

const bookCta: Section = {
  kind: "cta",
  heading: "Begin your retreat",
  body: "Speak with a wellness advisor or reserve your dates now and complete the medical questionnaire online before you arrive.",
  primary: { label: "Book Wellness Stay", href: "/book-now" },
  secondary: { label: "Talk to an Advisor", href: "/contact" },
};

function page(def: PageDef): PageDef {
  return def;
}

export const PAGES: Record<string, PageDef> = {
  about: page({
    slug: "about",
    title: "About Centurion Wellness",
    eyebrow: "Our story",
    summary:
      "A residential wellness and eco-tourism sanctuary on the Centurion University campus — where classical Ayurveda meets restored forest, an organic farm and quiet, sustainable luxury.",
    hero: "forest",
    sections: [
      {
        kind: "intro",
        heading: "Healing, the way nature intended",
        body: [
          "Centurion Wellness Eco Tourism is the official wellness and eco-tourism destination of Centurion University of Technology and Management, set inside the Paralakhemundi campus at the foothills of the Eastern Ghats. It is a living campus for whole-person health — guests come for a few days of rest or a full residential Panchakarma programme, and leave having reconnected with a slower rhythm.",
          "Everything here is designed to lower the noise: architecture that opens to the tree line, a kitchen that cooks to your doctor's prescription, and 120 acres of trails, water bodies and farmland to wander.",
        ],
      },
      {
        kind: "stats",
        items: [
          { value: 50, suffix: "+", label: "Ayurvedic Therapies" },
          { value: 16, label: "Rooms" },
          { value: 120, label: "Acres of Forest" },
          { value: 40, label: "Acre Organic Farm" },
        ],
      },
      {
        kind: "features",
        heading: "What guides us",
        items: [
          { title: "Nature first", text: "Low-impact building, native planting, solar hot water and zero single-use plastic across the estate." },
          { title: "Clinical Ayurveda", text: "Qualified vaidyas lead every programme with documented assessment, treatment and follow-up." },
          { title: "Farm to table", text: "Most produce is grown on our organic farm and cooked in a sattvic, millet-forward kitchen." },
          { title: "University-backed", text: "Research, training and continuity of care from Centurion University's health-sciences faculty." },
        ],
      },
      bookCta,
    ],
  }),

  "about-university": page({
    slug: "about-university",
    title: "About Centurion University",
    eyebrow: "The university",
    summary:
      "Centurion Wellness Eco Tourism is an initiative of Centurion University of Technology and Management — a multi-sector, skill-integrated university rooted in Odisha, with its founding campus at Paralakhemundi in the Gajapati district.",
    hero: "drone",
    parent: { label: "About Centurion Wellness", href: "/about" },
    sections: [
      {
        kind: "intro",
        heading: "A university built on skill and community",
        body: [
          "Centurion University of Technology and Management (CUTM) was established in 2010 as a state private university in Odisha. It grew from a rural engineering and skills institute at Paralakhemundi into a multi-campus university spanning Odisha and Andhra Pradesh, with a mandate to make higher education practical, employable and inclusive.",
          "The Paralakhemundi campus — where the wellness centre sits — lies at the foothills of the Eastern Ghats near Mahendragiri, on a large green campus of farmland, orchards, water bodies and forest. Agriculture, fisheries, veterinary science, food processing, engineering and management are taught alongside working farms, hatcheries and skill parks, and much of the university's work is with the tribal and farming communities of the Gajapati region.",
        ],
      },
      {
        kind: "stats",
        items: [
          { value: 120, label: "Acre green campus, Paralakhemundi" },
          { value: 2, label: "States — Odisha & Andhra Pradesh" },
          { value: 30, suffix: "+", label: "Skill-integrated disciplines" },
          { value: 15, suffix: "+", label: "Years of the Paralakhemundi campus" },
        ],
      },
      {
        kind: "features",
        heading: "What the university is known for",
        items: [
          { title: "Skill-integrated education", text: "Degrees delivered with hands-on production centres — students learn by doing across every school." },
          { title: "Agriculture, fisheries & veterinary", text: "Working farms, hatcheries and animal-science facilities on the Paralakhemundi campus." },
          { title: "Research & innovation", text: "Applied research in food, agri-tech, renewable energy and rural livelihoods." },
          { title: "Community & tribal engagement", text: "Long-running programmes with farmer producer groups and Saura tribal communities of Gajapati." },
          { title: "Sustainability", text: "Solar energy, organic cultivation, water harvesting and biodiversity conservation across the estate." },
          { title: "The Eastern Ghats setting", text: "A campus among hills, rivers and forest — the natural backdrop for the wellness centre." },
        ],
      },
      {
        kind: "cta",
        heading: "About the university",
        body: "For admissions, schools, research and campuses, visit the main Centurion University website.",
        primary: { label: "cutm.ac.in", href: "https://cutm.ac.in" },
        secondary: { label: "Sightseeing", href: "/sightseeing" },
      },
    ],
  }),

  "campus-experiences": page({
    slug: "campus-experiences",
    title: "Campus Experiences",
    eyebrow: "The university",
    summary:
      "The Paralakhemundi campus is a working landscape of farms, orchards, a hatchery and skill workshops. Guests can join guided visits between wellness sessions.",
    hero: "organic-farm",
    parent: { label: "About Centurion University", href: "/about-university" },
    sections: [
      {
        kind: "cards",
        heading: "Guided campus visits",
        category: "organic-farm",
        items: [
          { title: "Organic Farm Tour", text: "Walk the vegetable plots, orchards and composting yards that supply the wellness kitchen.", photo: "/media/library/AP1GczPfJXsBZlp79Y-RMUOMiF9Az3m1O-NrVSxe.jpg" },
          { title: "Dairy Experience", text: "A morning at the campus dairy — milking, fodder and animal care.", photo: "/media/library/AP1GczMvdFfBse29YqFpu34XCLc5xgFhzPHIKrre.jpg" },
          { title: "Innovation Labs", text: "Food processing, agri-tech and renewable-energy workshops where students build and test.", photo: "/media/library/AP1GczODNG-ezKfCptKPglV0n1rxvE1uKNghPeaw.jpg" },
          { title: "Sports Complex", text: "Athletics track, courts and the campus ground for early-morning activity.", photo: "/media/library/AP1GczMAubR_gp3MXjIrEK-_ARp6pDylEC3R0tKZ.jpg" },
          { title: "Cultural Experience", text: "Folk music, classical dance and seasonal festivals with the campus community.", photo: "/media/library/AP1GczPvI6VYEr7ZGBGOW8Qf79HL9CTZ9WzhubHN.jpg" },
        ],
      },
      bookCta,
    ],
  }),

  "ayurveda-wellness-centre": page({
    slug: "ayurveda-wellness-centre",
    title: "Ayurveda Wellness Centre",
    eyebrow: "Wellness",
    summary:
      "The clinical heart of the wellness centre: consultation rooms, a Panchakarma theatre, herbal pharmacy and treatment suites, staffed by resident doctors and trained therapists.",
    hero: "ayurveda",
    sections: [
      {
        kind: "steps",
        heading: "How a programme works",
        body: "A one-to-one consultation and dosha assessment set your plan; your physician then reviews and adjusts it every 48 hours.",
        items: [
          { title: "Assess", text: "Pulse diagnosis, history and dosha analysis with your assigned doctor." },
          { title: "Prescribe", text: "A personalised plan — therapies, herbal medicines, diet chart and daily routine." },
          { title: "Treat", text: "Supervised therapies each day with a consistent therapist and progress notes." },
          { title: "Sustain", text: "A take-home routine, diet guidance and a tele-follow-up after you leave." },
        ],
      },
      {
        kind: "cards",
        heading: "Explore the centre",
        category: "spa",
        items: [
          { title: "Panchakarma Treatments", text: "Classical five-action detoxification, done under daily medical supervision.", href: "/panchakarma-treatments" },
          { title: "Individual Therapies", text: "Shirodhara, Abhyanga, Pizhichil, Kati Basti and 50+ more.", href: "/therapies" },
          { title: "Wellness Packages", text: "Fixed-inclusion programmes from 1 to 14 days.", href: "/wellness-packages" },
        ],
      },
      bookCta,
    ],
  }),

  "wellness-programs": page({
    slug: "wellness-programs",
    title: "Wellness Programs",
    eyebrow: "Wellness",
    summary:
      "Residential retreat programmes from three to twenty-one nights, each with a defined goal, daily schedule, doctor, diet and room options.",
    hero: "meditation",
    sections: [
      {
        kind: "cards",
        heading: "Residential retreats",
        category: "ayurveda",
        items: [
          { title: "Panchakarma Detox", text: "Deep classical cleanse, 7–21 nights, full medical supervision." },
          { title: "Stress Relief", text: "Nervous-system reset with Shirodhara, yoga nidra and forest therapy." },
          { title: "Weight Management", text: "Metabolic reset through Udwarthanam, diet and movement." },
          { title: "Immunity Boost", text: "Rasayana rejuvenation and seasonal cleansing." },
          { title: "Digital Detox", text: "Device-free days, journaling and guided silence." },
          { title: "Couple Retreat", text: "Shared therapies and private dining for two." },
          { title: "Senior Wellness", text: "Gentle mobility, joint care and Kati/Janu Basti." },
          { title: "Corporate Wellness", text: "Cohort programmes for teams and leadership groups." },
        ],
      },
      {
        kind: "features",
        heading: "Every programme includes",
        items: [
          { title: "Doctor & assessment", text: "Assigned physician, dosha analysis and 48-hour reviews." },
          { title: "Daily therapy schedule", text: "Supervised treatments with progress notes." },
          { title: "Prescribed meals", text: "Diet chart cooked in the wellness kitchen." },
          { title: "Yoga & meditation", text: "Sunrise practice, pranayama and guided rest." },
          { title: "Accommodation", text: "Choice of room, cottage or villa." },
          { title: "Take-home plan", text: "Routine, diet and a tele-follow-up." },
        ],
      },
      bookCta,
    ],
  }),

  "panchakarma-treatments": page({
    slug: "panchakarma-treatments",
    title: "Panchakarma Treatments",
    eyebrow: "Wellness",
    summary:
      "The classical five-action purification therapy — preparation, elimination and rejuvenation — delivered over a residential stay under daily medical supervision.",
    hero: "spa",
    parent: { label: "Ayurveda Wellness Centre", href: "/ayurveda-wellness-centre" },
    sections: [
      {
        kind: "intro",
        body: [
          "Panchakarma is not a spa package. It is a staged medical process: internal and external oleation (Snehana), fomentation (Swedana), the main cleansing actions (Vamana, Virechana, Basti, Nasya, Raktamokshana as indicated), and a carefully paced rebuilding phase.",
        ],
      },
      {
        kind: "steps",
        heading: "The three phases",
        items: [
          { title: "Purva Karma", text: "Preparation — oleation and fomentation to mobilise toxins." },
          { title: "Pradhana Karma", text: "The main cleansing action selected for your constitution and condition." },
          { title: "Paschat Karma", text: "Graded diet, rest and Rasayana to rebuild strength and immunity." },
        ],
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          { q: "How long does it take?", a: "A meaningful Panchakarma runs 7–21 nights. Shorter stays use preparatory and palliative therapies rather than full elimination." },
          { q: "Is it safe for me?", a: "A pre-arrival medical questionnaire and on-site assessment determine suitability. Some conditions and medications require modification." },
          { q: "Will I be able to work?", a: "We recommend treating it as full rest. Wi-Fi is available but the schedule is intentionally demanding of your time." },
        ],
      },
      bookCta,
    ],
  }),

  therapies: page({
    slug: "therapies",
    title: "Ayurvedic Therapies",
    eyebrow: "Wellness",
    summary:
      "Individual wellness treatments, each bookable on its own. Tariffs are in ₹ and inclusive of applicable GST.",
    hero: "spa",
    parent: { label: "Ayurveda Wellness Centre", href: "/ayurveda-wellness-centre" },
    sections: [
      {
        kind: "pricing",
        heading: "Individual Wellness Treatments",
        body: "Tariff in ₹. Therapies and charges may vary post consultation based on health condition.",
        items: [
          { name: "Fitness Review & Ayurvedic Consultation (One-Time)", price: "₹1,000", features: [], href: "/book-now" },
          { name: "Abhyanga Swedana", price: "₹2,200", features: [], href: "/book-now" },
          { name: "Elakizhi", price: "₹2,500", features: [], href: "/book-now" },
          { name: "Njavarakizhi", price: "₹2,800", features: [], href: "/book-now" },
          { name: "Sirodhara", price: "₹3,200", features: [], href: "/book-now" },
          { name: "Njavara Facial", price: "₹1,200", features: [], href: "/book-now" },
          { name: "Herbal Facial", price: "₹1,000", features: [], href: "/book-now" },
          { name: "Customized Diet Plan (Per Day)", price: "₹800", features: [], href: "/book-now" },
        ],
      },
      bookCta,
    ],
  }),

  "wellness-packages": page({
    slug: "wellness-packages",
    title: "Wellness Packages",
    eyebrow: "Wellness",
    summary:
      "Five fixed-inclusion Ayurveda packages, from a one-day introduction to a fourteen-day intensive Panchakarma. All prices are inclusive of applicable GST.",
    hero: "meditation",
    sections: [
      {
        kind: "pricing",
        heading: "Wellness Packages",
        body: "Prices are inclusive of GST. Accommodation / wellness stay charges are extra, and diet is ₹800 per day (extra). Therapies and charges may vary post consultation based on health condition.",
        items: [
          { name: "Wellness Introduction", price: "₹5,000", cadence: "1-Day · incl. GST", features: ["Consultation", "1-Day Diet Plan", "Abhyanga Swedana", "Herbal Facial"], href: "/book-now" },
          { name: "Spine & Joint Starter", price: "₹11,500", cadence: "3-Day · incl. GST", features: ["Consultation", "3-Day Diet Plan", "Abhyanga Swedana", "Elakizhi", "Abhyanga Swedana", "Njavara Facial"], href: "/book-now" },
          { name: "De-Stress & Detox", price: "₹18,600", cadence: "5-Day · incl. GST", features: ["Consultation", "5-Day Diet Plan", "Abhyanga Swedana (2 Days)", "Elakizhi (2 Days)", "Sirodhara", "Herbal Facial"], href: "/book-now" },
          { name: "Complete Mind-Body Wellness", price: "₹26,000", cadence: "7-Day · incl. GST", features: ["Consultation", "7-Day Diet Plan", "Abhyanga Swedana (2 Days)", "Elakizhi (2 Days)", "Njavarakizhi (2 Days)", "Sirodhara", "Njavara Facial"], href: "/book-now", featured: true },
          { name: "Intensive Panchakarma Transformation", price: "₹51,200", cadence: "14-Day · incl. GST", features: ["Consultation & Mid-Program Check", "14-Day Diet Plan", "Abhyanga Swedana (4 Days)", "Elakizhi (4 Days)", "Njavarakizhi (3 Days)", "Sirodhara (3 Days)", "Njavara Facial"], href: "/book-now" },
        ],
      },
      {
        kind: "intro",
        heading: "Every package includes",
        body: [
          "Initial Ayurvedic Consultation / Fitness Review",
          "Scheduled Wellness Therapies",
          "Daily Therapy Monitoring",
          "Complimentary Ayurvedic Wellness Dinner every day",
          "Wellness Progress Review",
          "Use of Yoga & Meditation Spaces",
        ],
      },
      bookCta,
    ],
  }),

  "luxury-stay": page({
    slug: "luxury-stay",
    title: "Wellness Stay",
    eyebrow: "Stay",
    summary:
      "Comfortable accommodation surrounded by lush gardens, green hills and the peaceful natural surroundings of the campus — Suite and Executive rooms, single or double occupancy, with food included.",
    hero: "rooms",
    sections: [
      { kind: "gallery", heading: "Inside the rooms", category: "rooms" },
      {
        kind: "cards",
        heading: "Room categories",
        body: "Tariffs are per night and include food. Choose single or double occupancy when you book — a companion travelling with a treatment guest should book a double-occupancy room.",
        category: "rooms",
        items: [
          { title: "Suite Room — Single Occupancy", text: "₹5,500 per night, with food.", photo: "/media/library/AP1GczNDL08G29wth-dTeBL8SdPK5xBqkz_UiDqX.jpg" },
          { title: "Suite Room — Double Occupancy", text: "₹7,500 per night, with food.", photo: "/media/library/AP1GczPbcpPjVNKTZ2UiDE-C88QGTS6vllhLQdHI.jpg" },
          { title: "Executive Room — Single Occupancy", text: "₹4,000 per night, with food.", photo: "/media/library/AP1GczNucaub43aNfjVfXa7i_hOHvP9ip99biBYL.jpg" },
          { title: "Executive Room — Double Occupancy", text: "₹6,500 per night, with food.", photo: "/media/library/AP1GczNY7bzIL55wR3SDzm6gR865rxB_YNpMn8EZ.jpg" },
        ],
      },
      {
        kind: "features",
        heading: "In every room",
        items: [
          { title: "Private verandah", text: "Step out to the greenery and peaceful surroundings from your own verandah." },
          { title: "Attached bathroom", text: "Hot shower, basin and washroom facilities in every room." },
          { title: "Air-conditioned", text: "Comfortable rooms with air-conditioning and large windows." },
          { title: "Food included", text: "Room tariffs include meals; diet-chart meals for programme guests are ₹800 per day." },
        ],
      },
      bookCta,
    ],
  }),

  dining: page({
    slug: "dining",
    title: "Dining",
    eyebrow: "Dining",
    summary:
      "One place to eat, cooking to season and — if you wish — to prescription: a farm-to-table restaurant, an all-day organic café, a millet-forward wellness kitchen and a herbal tea lounge.",
    hero: "dining",
    sections: [
      {
        kind: "features",
        heading: "Where to eat",
        items: [
          { title: "Farm-to-Table Restaurant", text: "The main dining hall — sattvic thalis and live counters, from what the farm harvested that morning." },
          { title: "Organic Café", text: "All-day light plates, cold-pressed juices and sourdough from ancient grains, on the farm edge. No refined sugar, no seed oils." },
          { title: "Wellness Kitchen", text: "The therapeutic kitchen that cooks each programme guest's diet chart — ragi, foxtail and little millet in place of polished rice." },
          { title: "Herbal Tea Lounge", text: "Rotating single-herb infusions through the day and evening kadhas." },
        ],
      },
      bookCta,
    ],
  }),

  "eco-tourism": page({
    slug: "eco-tourism",
    title: "Eco Tourism",
    eyebrow: "Eco Tourism",
    summary:
      "Guided nature experiences across the 120-acre campus — forest, water bodies and working farmland.",
    hero: "forest",
    sections: [
      {
        kind: "intro",
        heading: "Under progress",
        body: [
          "Our eco-tourism programme — nature trails, birding, farm visits and guided walks — is being put together. Please check back soon, or ask reception about what is currently available.",
        ],
      },
    ],
  }),

  "nature-trails": page({
    slug: "nature-trails",
    title: "Nature Trails",
    eyebrow: "Eco Tourism",
    summary: "Waymarked walking routes across the campus — through restored forest, along the water and around the working farm.",
    hero: "forest",
    parent: { label: "Eco Tourism", href: "/eco-tourism" },
    sections: [
      {
        kind: "features",
        heading: "Walking the campus",
        items: [
          { title: "Graded routes", text: "Short level loops through to longer walks with a climb — a naturalist can match one to your morning." },
          { title: "Forest & water", text: "Shaded canopy paths, open stretches by the water and a circuit through the orchards and vegetable plots." },
          { title: "Best at first light", text: "Cooler air, more birds, and the quietest part of the day." },
          { title: "Guided or self-guided", text: "Join a scheduled walk or ask reception for directions and set out on your own." },
        ],
      },
      { kind: "intro", body: ["Walks are arranged through reception or the guest portal and adjusted around your treatment schedule."] },
      bookCta,
    ],
  }),

  experiences: page({
    slug: "experiences",
    title: "Experiences",
    eyebrow: "Eco Tourism",
    summary: "Book a single experience or string several across your stay — most run daily and last between one and four hours.",
    hero: "events",
    parent: { label: "Eco Tourism", href: "/eco-tourism" },
    sections: [
      {
        kind: "steps",
        heading: "Booking an experience",
        items: [
          { title: "Browse the calendar", text: "In the guest portal or at reception." },
          { title: "Reserve a slot", text: "Group sizes are capped to keep it quiet." },
          { title: "Meet your guide", text: "At the trailhead or studio, gear provided." },
        ],
      },
      bookCta,
    ],
  }),

  yoga: page({
    slug: "yoga",
    title: "Yoga",
    eyebrow: "Eco Tourism",
    summary: "Daily therapeutic yoga on an open deck above the lake — led by certified faculty and matched to your programme.",
    hero: "yoga",
    sections: [
      {
        kind: "features",
        heading: "The practice",
        items: [
          { title: "Sunrise session", text: "Gentle asana, pranayama and a short seated meditation." },
          { title: "Therapeutic focus", text: "Modifications for back, joints, breath and sleep." },
          { title: "Yoga nidra", text: "Afternoon guided deep rest — part of stress programmes." },
          { title: "Private sessions", text: "One-to-one on request with a yoga therapist." },
        ],
      },
      bookCta,
    ],
  }),

  meditation: page({
    slug: "meditation",
    title: "Meditation",
    eyebrow: "Eco Tourism",
    summary: "Guided sittings, forest sound baths and silent walking — simple practices you can keep after you leave.",
    hero: "meditation",
    sections: [
      {
        kind: "features",
        heading: "Ways to practise",
        items: [
          { title: "Morning sit", text: "20 minutes, breath-based, all experience levels." },
          { title: "Forest sound bath", text: "Reclined session with singing bowls under the trees." },
          { title: "Walking meditation", text: "Slow, attentive laps of a shaded forest path." },
          { title: "Yoga nidra", text: "Guided body-scan for deep afternoon rest." },
        ],
      },
      { kind: "intro", body: ["Recorded guided audio is available in the guest portal to continue the practice at home."] },
      bookCta,
    ],
  }),

  faq: page({
    slug: "faq",
    title: "Frequently Asked Questions",
    eyebrow: "Discover",
    summary: "Arrival, programmes, medical suitability, food, connectivity and cancellation.",
    hero: "forest",
    sections: [
      {
        kind: "faq",
        heading: "Before you book",
        items: [
          { q: "How do I choose a programme?", a: "Tell us your goal and available dates through the enquiry form or booking flow; a wellness advisor recommends a programme and length. Your on-site doctor confirms and adjusts it." },
          { q: "Do I need to be unwell to come?", a: "No. Many guests come for preventive rest and rejuvenation. Programmes scale from a gentle 3-night reset to full clinical Panchakarma." },
          { q: "Is there a medical questionnaire?", a: "Yes — it's part of booking. It lets the clinical team prepare your plan and flag anything that needs modification." },
          { q: "What about food?", a: "All meals are vegetarian, mostly organic and grown on site. Programme guests eat to their prescribed diet chart. Allergies and preferences are recorded in the guest portal." },
          { q: "Will I have phone signal and Wi-Fi?", a: "Wi-Fi covers the rooms and public areas. Digital-detox programmes ask you to hand devices in voluntarily." },
          { q: "What is the cancellation policy?", a: "Full refund up to 14 days before arrival, 50% up to 7 days, non-refundable inside 72 hours — with medical exceptions. Full terms are shown at checkout." },
        ],
      },
      bookCta,
    ],
  }),

  contact: page({
    slug: "contact",
    title: "Contact",
    eyebrow: "Discover",
    summary: "Reach the reservations desk, request a callback, or ask the wellness team a question.",
    hero: "forest",
    sections: [{ kind: "contact", heading: "Get in touch" }],
  }),

  careers: page({
    slug: "careers",
    title: "Careers",
    eyebrow: "Discover",
    summary: "Join a team of physicians, therapists, naturalists, chefs and hospitality professionals building something unusual.",
    hero: "organic-farm",
    sections: [
      {
        kind: "cards",
        heading: "Open roles",
        category: "organic-farm",
        items: [
          { title: "Consultant Physician — Ayurveda", text: "BAMS/MD, 5+ years, Panchakarma experience." },
          { title: "Senior Panchakarma Therapist", text: "Formal training and 3+ years in a residential centre." },
          { title: "Naturalist Guide", text: "Field ecology background; birding knowledge a plus." },
          { title: "Sous Chef — Plant-based", text: "Millet and fermentation experience preferred." },
        ],
      },
      { kind: "intro", body: ["Applications are handled through the Centurion University HR portal. Write to careers@cutm.ac.in with your CV and the role you are interested in."] },
    ],
  }),

  "gift-cards": page({
    slug: "gift-cards",
    title: "Gift Cards",
    eyebrow: "More",
    summary: "Give rest. Digital gift cards redeemable against any stay, programme or therapy.",
    hero: "spa",
    sections: [
      {
        kind: "pricing",
        heading: "Denominations",
        items: [
          { name: "Day of Calm", price: "₹6,000", features: ["One therapy + lunch", "Valid 12 months", "Delivered by email"], href: "/contact" },
          { name: "Weekend Reset", price: "₹32,000", features: ["2-night short stay", "Consultation + 4 therapies", "Transferable"], href: "/contact", featured: true },
          { name: "Open Value", price: "Your amount", features: ["Any value from ₹2,000", "Stackable at checkout", "Valid 12 months"], href: "/contact" },
        ],
      },
      { kind: "intro", body: ["To arrange a gift card, contact us at prasant.panda@cutm.ac.in or +91 63717 45061. Cards are delivered by email and are valid for twelve months."] },
    ],
  }),

  "corporate-retreats": page({
    slug: "corporate-retreats",
    title: "Corporate Retreats",
    eyebrow: "More",
    summary: "Offsites that leave teams genuinely restored — cohort wellness programmes, leadership resets and digital-detox weeks.",
    hero: "events",
    sections: [
      {
        kind: "features",
        heading: "What we arrange",
        items: [
          { title: "Cohort programmes", text: "8–40 people, shared schedule, private dining." },
          { title: "Dedicated facilitation", text: "A physician and a programme lead assigned to your group." },
          { title: "Meeting space", text: "A daylight room on the forest edge when you do need to work." },
          { title: "Outcome report", text: "Anonymised wellbeing and sleep data for the group." },
        ],
      },
      {
        kind: "cta",
        heading: "Plan a corporate retreat",
        body: "Send us your group size, dates and goals and we'll come back with a tailored proposal.",
        primary: { label: "Request a proposal", href: "/contact" },
        secondary: { label: "See wellness programmes", href: "/wellness-programs" },
      },
    ],
  }),

  "international-guests": page({
    slug: "international-guests",
    title: "International Guests",
    eyebrow: "More",
    summary: "Visa guidance, airport transfers, medical-visa support and everything needed to plan a residential stay from abroad.",
    hero: "drone",
    sections: [
      {
        kind: "features",
        heading: "We help with",
        items: [
          { title: "Medical-visa letter", text: "Issued on confirmed booking for longer programmes." },
          { title: "Airport pickup", text: "From Bhubaneswar (BBI) or Visakhapatnam (VTZ)." },
          { title: "Currency & payments", text: "International cards, bank transfer and on-arrival settlement." },
          { title: "Dietary & language", text: "English-speaking clinical staff; most dietary needs met." },
        ],
      },
      { kind: "faq", heading: "Travel questions", items: [
        { q: "Which airport is closest?", a: "Bhubaneswar (BBI) is the main gateway, roughly a 3-hour transfer. Visakhapatnam (VTZ) is an alternative." },
        { q: "How early should I book?", a: "For programmes of 10+ nights, book 6–8 weeks ahead to allow for visa paperwork." },
      ]},
      bookCta,
    ],
  }),

  membership: page({
    slug: "membership",
    title: "Membership",
    eyebrow: "More",
    summary: "An annual membership for regular guests — priority dates, standing therapy credits and a continuous care record.",
    hero: "ayurveda",
    sections: [
      {
        kind: "pricing",
        heading: "Annual tiers",
        items: [
          { name: "Green", price: "₹40,000", cadence: "/ year", features: ["10% off all stays", "4 day-therapy credits", "Priority waitlist"], href: "/contact" },
          { name: "Forest", price: "₹1,10,000", cadence: "/ year", features: ["18% off all stays", "2 nights + 6 therapy credits", "Annual physician review", "Guest passes x2"], href: "/contact", featured: true },
          { name: "Sanctuary", price: "₹2,50,000", cadence: "/ year", features: ["25% off all stays", "5 nights + 12 credits", "Dedicated physician", "Room upgrades"], href: "/contact" },
        ],
      },
      { kind: "intro", body: ["To join or renew, contact our membership desk. Members manage credits, dates and their care record from the guest portal."] },
    ],
  }),

  // "book-now" has a dedicated route: src/app/book-now/page.tsx

};

export const PAGE_SLUGS = Object.keys(PAGES);

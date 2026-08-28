import type { MediaCategory, MediaItem } from "@/lib/media";

/**
 * Sightseeing — day trips from the wellness centre into the Eastern Ghats,
 * the tribal heartland and the heritage of the Paralakhemundi region.
 *
 * Distances and travel times are from the Paralakhemundi campus and are
 * approximate; roads and river crossings vary by season.
 */

export interface Destination {
  slug: string;
  name: string;
  tag: string;
  hero: MediaCategory;
  summary: string;
  history: string[];
  distanceKm: number;
  travelTime: string;
  bestSeason: string;
  activities: string[];
  /** Approximate coordinates for the "Open in Maps" link. */
  coords: { lat: number; lng: number };
  /**
   * Location photograph. Freely-licensed images from Wikimedia Commons, served
   * from /media/library/ (see scripts/sightseeing-media.json). Destinations
   * without one fall back to the house category photography.
   */
  image?: { src: string; width: number; height: number; alt: string; credit: string };
}

export const destinations: Destination[] = [
  {
    slug: "mahendragiri-hills",
    name: "Mahendragiri Hills",
    tag: "Sacred peak of the Eastern Ghats",
    hero: "forest",
    summary:
      "The second-highest peak in Odisha, wrapped in myth and mist. A pilgrimage hill of ancient stone temples, cool forest and long views over Gajapati.",
    history: [
      "Mahendragiri rises to about 1,500 metres in the southern Eastern Ghats. It is named in the Mahabharata and the Ramayana as the abode of Parashurama, and a cluster of temples on its upper slopes — Kunti, Yudhishthira, Bhima and the Parashurama shrine — are attributed to the Pandavas and built in early Kalinga stone style.",
      "The hill is also a botanist's site: its higher reaches hold relict patches of semi-evergreen forest and orchids not found in the plains. A festival draws pilgrims each Shivaratri; the rest of the year it is quiet.",
    ],
    distanceKm: 35,
    travelTime: "1 hr 15 min",
    bestSeason: "October – February",
    activities: ["Guided temple walk", "Forest birding", "Sunrise viewpoint", "Photography"],
    coords: { lat: 18.9667, lng: 84.3667 },
    image: {
      src: "/media/library/sightseeing-mahendragiri-hills.jpg",
      width: 1600,
      height: 1142,
      alt: "Forested slopes of the Mahendragiri hills, Gajapati, Odisha",
      credit: "Subhamsahoo2008, CC BY-SA 4.0, via Wikimedia Commons",
    },
  },
  {
    slug: "gandahati-waterfall",
    name: "Gandahati Waterfall",
    tag: "Falls in a deer sanctuary",
    hero: "waterfalls",
    summary:
      "The Mahendratanaya river drops through forest near Mohana, inside a small deer park. A short, easy trail leads to the pools — a favourite half-day trip.",
    history: [
      "Gandahati sits on the edge of a reserve forest in the Mohana block of Gajapati. The falls are fed by the Mahendratanaya, which rises on Mahendragiri, and run strongest from July to November.",
      "A fenced enclosure beside the falls shelters spotted deer, and the surrounding sal forest is good for butterflies and small birds. Simple steps and a viewing platform make it accessible for most guests.",
    ],
    distanceKm: 38,
    travelTime: "1 hr 20 min",
    bestSeason: "August – December (post-monsoon flow)",
    activities: ["Waterfall trail", "Deer park", "Riverside picnic", "Butterfly watching"],
    coords: { lat: 19.1333, lng: 84.2167 },
    image: {
      src: "/media/library/sightseeing-gandahati-waterfall.jpg",
      width: 1600,
      height: 1200,
      alt: "Gandahati waterfall on the Mahendratanaya river near Mohana",
      credit: "Dream is ToExplore, CC BY-SA 4.0, via Wikimedia Commons",
    },
  },
  {
    slug: "gajapati-palace",
    name: "Gajapati Palace, Paralakhemundi",
    tag: "Indo-Saracenic royal seat",
    hero: "events",
    summary:
      "The palace of the Gajapati kings in the heart of Paralakhemundi town — a landmark of early-20th-century Indo-Saracenic architecture, a short drive from the campus.",
    history: [
      "Paralakhemundi was the seat of a line of Gajapati rulers whose patronage shaped Odia language and letters — Krushna Chandra Gajapati was a key figure in the creation of a separate Odisha province in 1936.",
      "The main palace, designed in the early 1900s, blends European and Mughal elements with local craft. The town around it keeps the grid the kings laid out, with temples, tanks and the old Maharaja's college nearby.",
    ],
    distanceKm: 5,
    travelTime: "15 min",
    bestSeason: "All year",
    activities: ["Heritage walk", "Architecture photography", "Old-town temples", "Local market"],
    coords: { lat: 18.7807, lng: 84.0827 },
    image: {
      src: "/media/library/sightseeing-gajapati-palace.jpg",
      width: 900,
      height: 1600,
      alt: "The Gajapati palace at Paralakhemundi",
      credit: "Santosh Kumar Panda, CC0, via Wikimedia Commons",
    },
  },
  {
    slug: "brundaban-palace",
    name: "Brundaban Palace",
    tag: "Garden palace of the Gajapatis",
    hero: "gallery",
    summary:
      "A quieter royal residence set in gardens on the edge of Paralakhemundi, used by the family for retreat. Its grounds and pavilions make an easy morning visit.",
    history: [
      "Brundaban was built as a garden palace away from the ceremonial main palace, with orchards, a tank and open pavilions in the Odia style.",
      "It reflects the same period of Gajapati patronage as the town's other landmarks and is often paired with the main palace on a single heritage circuit.",
    ],
    distanceKm: 4,
    travelTime: "12 min",
    bestSeason: "All year",
    activities: ["Garden walk", "Heritage photography", "Combined palace circuit"],
    coords: { lat: 18.79, lng: 84.09 },
  },
  {
    slug: "padmasambhava-mahavihara",
    name: "Padmasambhava Mahavihara, Jirang",
    tag: "Himalayan monastery in the Ghats",
    hero: "meditation",
    summary:
      "One of the largest Tibetan Buddhist monasteries in eastern India, at Chandragiri–Jirang. Gilded halls, a giant Padmasambhava statue and a settlement of Tibetan refugees.",
    history: [
      "Tibetan families resettled at Chandragiri in the 1960s. The Padmasambhava Mahavihara, consecrated by the Dalai Lama in 2010, is the spiritual centre of the settlement and follows the Nyingma tradition.",
      "The prayer hall, stupa and 23-foot Padmasambhava image sit against forested hills, and the settlement's carpet weaving and Tibetan food are part of the visit.",
    ],
    distanceKm: 55,
    travelTime: "1 hr 45 min",
    bestSeason: "October – March",
    activities: ["Monastery visit", "Prayer-hall darshan", "Tibetan handicrafts", "Quiet meditation"],
    coords: { lat: 19.0333, lng: 84.0167 },
  },
  {
    slug: "taptapani",
    name: "Taptapani Hot Spring",
    tag: "Sulphur spring in the forest",
    hero: "forest",
    summary:
      "A natural hot sulphur spring on the forested Ghat road, with a temple, a small deer park and a state guest house. Long associated with skin ailments and rest.",
    history: [
      "Taptapani, meaning 'hot water', is a perennial spring that surfaces at around 40–45°C. A shrine to Kandhuni Devi stands over the source, and pilgrims and travellers have stopped here for generations.",
      "The surrounding reserve forest is part of the Ganjam–Gajapati Ghats. A bathing pool is fed from the spring, and the site is a common stop between Berhampur and the tribal uplands.",
    ],
    distanceKm: 58,
    travelTime: "1 hr 30 min",
    bestSeason: "November – February",
    activities: ["Hot-spring soak", "Forest drive", "Deer park", "Temple visit"],
    coords: { lat: 19.5167, lng: 84.4167 },
    image: {
      src: "/media/library/sightseeing-taptapani.jpg",
      width: 1600,
      height: 1200,
      alt: "The Taptapani hot spring pool in the forest, Odisha",
      credit: "Krupasindhu Muduli, CC BY-SA 3.0, via Wikimedia Commons",
    },
  },
  {
    slug: "saura-villages",
    name: "Saura Tribal Villages",
    tag: "Living art of the Eastern Ghats",
    hero: "events",
    summary:
      "Villages of the Saura (Sora) people in the hills around Gajapati, known for 'idital' wall paintings, terraced cultivation and a distinct musical tradition.",
    history: [
      "The Saura are one of Odisha's oldest tribal communities, mentioned in early texts and concentrated in the Gajapati and Rayagada hills. Their idital paintings — geometric figures of people, animals and spirits — are made on house walls for rituals and are now recognised as a folk-art form.",
      "Visits are arranged with community hosts and the university's outreach teams, with respect for daily life. Terraced millet and turmeric fields, bamboo craft and songs are part of the day.",
    ],
    distanceKm: 45,
    travelTime: "1 hr 30 min",
    bestSeason: "November – March",
    activities: ["Community-hosted village walk", "Idital wall art", "Craft & music", "Farm terraces"],
    coords: { lat: 19.0833, lng: 83.8167 },
    image: {
      src: "/media/library/sightseeing-saura-villages.jpg",
      width: 1600,
      height: 752,
      alt: "Saura idital wall painting from the Gajapati hills",
      credit: "Hpsatapathy, CC BY-SA 3.0, via Wikimedia Commons",
    },
  },
  {
    slug: "mahendratanaya-river",
    name: "Mahendratanaya River",
    tag: "The river off Mahendragiri",
    hero: "waterfalls",
    summary:
      "The river that rises on Mahendragiri and runs past Paralakhemundi. Broad sandy stretches, quiet ghats and good light in the early morning and late evening.",
    history: [
      "The Mahendratanaya drains the southern slopes of Mahendragiri and joins the Vamsadhara system on its way to the sea. It has shaped Paralakhemundi's farmland and its water supply for centuries.",
      "Near the town the river is calm and shallow for much of the year — used for washing, small-scale fishing and, on festival days, ritual bathing.",
    ],
    distanceKm: 10,
    travelTime: "20 min",
    bestSeason: "October – March",
    activities: ["Riverside walk", "Sunrise photography", "Birding on the sandbars", "Picnic"],
    coords: { lat: 18.81, lng: 84.06 },
  },
];

export const destinationBySlug = (slug: string) =>
  destinations.find((d) => d.slug === slug);

/** The destination's own photograph as a MediaItem, or null to fall back. */
export function destinationImage(d: Destination): MediaItem | null {
  if (!d.image) return null;
  return {
    id: `sightseeing-${d.slug}`,
    category: d.hero,
    src: d.image.src,
    width: d.image.width,
    height: d.image.height,
    alt: d.image.alt,
    credit: d.image.credit,
  };
}

/** Attribution lines for every destination that uses a licensed photo. */
export const destinationImageCredits = destinations
  .filter((d) => d.image)
  .map((d) => ({ name: d.name, credit: d.image!.credit }));

import type { MediaCategory, MediaItem } from "@/lib/media";

/**
 * Sightseeing — day trips from the wellness centre into the Eastern Ghats,
 * the tribal heartland and the heritage of the Paralakhemundi region.
 *
 * Distances and travel times are from the Paralakhemundi campus and are
 * approximate; roads and river crossings vary by season.
 */

/**
 * Freely-licensed image from Wikimedia Commons, served from /media/library/
 * (fetched by scripts/fetch-sightseeing-media.mjs). `credit` is rendered on the
 * page to satisfy the CC attribution requirement.
 */
export interface DestImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
}

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
  /** How to get there from the Paralakhemundi campus. */
  gettingThere: string[];
  /** Approximate coordinates for the "Open in Maps" link. */
  coords: { lat: number; lng: number };
  /** Primary photograph (hero). Falls back to house category imagery if absent. */
  image?: DestImage;
  /** Extra photographs shown in the detail-page gallery. */
  gallery?: DestImage[];
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
      "Mahendragiri rises to about 1,500 metres in the southern Eastern Ghats — the second-highest point in Odisha. It is named in the Mahabharata and the Ramayana as the abode of Parashurama, and a cluster of temples on its upper slopes — Kunti, Yudhishthira, Bhima and the Parashurama shrine — are attributed to the Pandavas and built in early Kalinga stone style.",
      "The climb passes through dry deciduous forest that turns semi-evergreen higher up, with relict patches of montane grassland and orchids not found in the plains. The summit ridge gives long views across the Gajapati and Srikakulam hills, and the air is noticeably cooler than the valley.",
      "A large fair draws pilgrims on Shivaratri; for the rest of the year the hill is quiet and best visited early, before the afternoon haze.",
    ],
    distanceKm: 35,
    travelTime: "1 hr 15 min",
    bestSeason: "October – February",
    activities: ["Guided temple walk", "Forest birding", "Summit-ridge viewpoint", "Photography"],
    gettingThere: [
      "About 35 km from the campus (1 hr 15 min) — take the road to R.Udayagiri, then the marked turn for Mahendragiri.",
      "The last stretch is a narrow, winding hill road; a car or SUV manages it in the dry season, and reception arranges the vehicle and a driver who knows the route.",
      "Vehicles park near the base of the temple cluster; reaching the upper shrines is a short, steep walk of 20–30 minutes.",
      "Nearest railway station: Palasa (about 55 km) on the Howrah–Chennai line. Nearest airports: Visakhapatnam (VTZ, ~150 km) and Bhubaneswar (BBI, ~230 km).",
    ],
    coords: { lat: 18.9667, lng: 84.3667 },
    image: {
      src: "/media/library/sightseeing-mahendragiri-hills.jpg",
      width: 1080,
      height: 771,
      alt: "Forested slopes of the Mahendragiri hills, Gajapati, Odisha",
      credit: "Subhamsahoo2008, CC BY-SA 4.0, via Wikimedia Commons",
    },
    gallery: [
      {
        src: "/media/library/sightseeing-mahendragiri-hills-2.jpg",
        width: 1600,
        height: 1200,
        alt: "Early Kalinga-style stone temple on Mahendragiri attributed to Bhima",
        credit: "Vsvlss, CC BY-SA 4.0, via Wikimedia Commons",
      },
    ],
  },
  {
    slug: "gandahati-waterfall",
    name: "Gandahati Waterfall",
    tag: "Falls in a deer sanctuary",
    hero: "waterfalls",
    summary:
      "The Mahendratanaya river drops through forest near Mohana, inside a small deer park. A short, easy trail leads to the pools — a favourite half-day trip.",
    history: [
      "Gandahati sits on the edge of a reserve forest in the Mohana block of Gajapati. The falls are fed by the Mahendratanaya, which rises on Mahendragiri, and run strongest from July to November; by late spring they can slow to a trickle.",
      "A fenced enclosure beside the falls shelters spotted deer, and the surrounding sal forest is good for butterflies and small birds. Simple steps and a viewing platform make the main pool accessible for most visitors.",
    ],
    distanceKm: 38,
    travelTime: "1 hr 20 min",
    bestSeason: "August – December (post-monsoon flow)",
    activities: ["Waterfall trail", "Deer park", "Riverside picnic", "Butterfly watching"],
    gettingThere: [
      "About 38 km from the campus (1 hr 20 min) on the Mohana road; a metalled road runs almost to the site, then a flight of steps leads down to the pool.",
      "Best as a half-day trip — reception arranges a car and a packed breakfast.",
      "Flow is heaviest August–December. In the dry months the falls are gentle but the deer park and forest walk are still worthwhile.",
    ],
    coords: { lat: 19.1333, lng: 84.2167 },
    image: {
      src: "/media/library/sightseeing-gandahati-waterfall.jpg",
      width: 1600,
      height: 1200,
      alt: "Gandahati waterfall on the Mahendratanaya river near Mohana",
      credit: "Dream is ToExplore, CC BY-SA 4.0, via Wikimedia Commons",
    },
    gallery: [
      {
        src: "/media/library/sightseeing-gandahati-waterfall-2.jpg",
        width: 1600,
        height: 957,
        alt: "The wide lower cascade of the Gandahati falls",
        credit: "Soumyajyoti1997, CC BY-SA 4.0, via Wikimedia Commons",
      },
    ],
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
    gettingThere: [
      "In Paralakhemundi town, about 5 km from the campus — 15 minutes by car or auto-rickshaw.",
      "The palace is viewed from the outside; the surrounding old town, temples and market are part of the walk.",
      "Easy to combine with a stop at the Mahendratanaya river on the same morning.",
    ],
    coords: { lat: 18.7807, lng: 84.0827 },
    image: {
      src: "/media/library/sightseeing-gajapati-palace.jpg",
      width: 900,
      height: 1600,
      alt: "The Gajapati palace at Paralakhemundi",
      credit: "Santosh Kumar Panda, CC0, via Wikimedia Commons",
    },
    gallery: [
      {
        src: "/media/library/sightseeing-gajapati-palace-2.jpg",
        width: 597,
        height: 531,
        alt: "Facade detail of the Gajapati palace, Paralakhemundi",
        credit: "Chinmaya1973, CC BY-SA 4.0, via Wikimedia Commons",
      },
    ],
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
    gettingThere: [
      "About 58 km from the campus (1 hr 30 min) via the Digapahandi–Taptapani ghat road, a scenic climb through reserve forest.",
      "The spring, shrine and OTDC guest house are right by the road; the bathing pool is a short walk.",
    ],
    coords: { lat: 19.5167, lng: 84.4167 },
    image: {
      src: "/media/library/sightseeing-taptapani.jpg",
      width: 1333,
      height: 1000,
      alt: "The Taptapani hot spring pool in the forest, Odisha",
      credit: "Krupasindhu Muduli, CC BY-SA 3.0, via Wikimedia Commons",
    },
    gallery: [
      {
        src: "/media/library/sightseeing-taptapani-2.jpg",
        width: 1333,
        height: 1000,
        alt: "Steam rising off the Taptapani spring",
        credit: "Krupasindhu Muduli, CC BY-SA 3.0, via Wikimedia Commons",
      },
      {
        src: "/media/library/sightseeing-taptapani-3.jpg",
        width: 1333,
        height: 1000,
        alt: "The shrine beside the Taptapani spring",
        credit: "Krupasindhu Muduli, CC BY-SA 3.0, via Wikimedia Commons",
      },
    ],
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
    gettingThere: [
      "The villages lie 40–50 km into the hills around R.Udayagiri and Serango; the roads are narrow and slow, so allow 1 hr 30 min or more each way.",
      "This is not a drop-in visit — it is set up in advance with community hosts and the university's tribal-outreach team, who travel with the group.",
      "Full-day trip; carry water, wear modest clothing and ask before photographing people or homes.",
    ],
    coords: { lat: 19.0833, lng: 83.8167 },
    image: {
      src: "/media/library/sightseeing-saura-villages.jpg",
      width: 1600,
      height: 752,
      alt: "Saura idital wall painting from the Gajapati hills",
      credit: "Hpsatapathy, CC BY-SA 3.0, via Wikimedia Commons",
    },
    gallery: [
      {
        src: "/media/library/sightseeing-saura-villages-2.jpg",
        width: 1239,
        height: 1600,
        alt: "Detail of a Saura idital painting with figures and geometry",
        credit: "Sumita Roy Dutta, CC BY-SA 4.0, via Wikimedia Commons",
      },
    ],
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
    gettingThere: [
      "The river runs past Paralakhemundi; the nearest ghats and the Pathapatnam bridge are 8–12 km from the campus.",
      "Any auto-rickshaw or car from town reaches the riverbank in about 20 minutes.",
      "Best light is early morning and late evening. Keep away from the bank when the river is in spate during heavy monsoon.",
    ],
    coords: { lat: 18.81, lng: 84.06 },
    image: {
      src: "/media/library/sightseeing-mahendratanaya-river.jpg",
      width: 1600,
      height: 756,
      alt: "The Mahendratanaya river and the Pathapatnam–Paralakhemundi bridge",
      credit: "Narendra Modi, CC BY 3.0, via Wikimedia Commons",
    },
    gallery: [
      {
        src: "/media/library/sightseeing-mahendratanaya-river-2.jpg",
        width: 648,
        height: 486,
        alt: "Broad sandy stretch of the Mahendratanaya near Paralakhemundi",
        credit: "Chinmaya1973, CC BY-SA 4.0, via Wikimedia Commons",
      },
    ],
  },
];

export const destinationBySlug = (slug: string) =>
  destinations.find((d) => d.slug === slug);

function toItem(d: Destination, img: DestImage, i: number): MediaItem {
  return {
    id: `sightseeing-${d.slug}-${i}`,
    category: d.hero,
    src: img.src,
    width: img.width,
    height: img.height,
    alt: img.alt,
    credit: img.credit,
  };
}

/** The destination's primary photograph as a MediaItem, or null to fall back. */
export function destinationImage(d: Destination): MediaItem | null {
  return d.image ? toItem(d, d.image, 0) : null;
}

/** Primary + extra photographs for the detail-page gallery. */
export function destinationGallery(d: Destination): MediaItem[] {
  const imgs = [d.image, ...(d.gallery ?? [])].filter((x): x is DestImage => Boolean(x));
  return imgs.map((img, i) => toItem(d, img, i));
}

/** One attribution line per destination that uses licensed photos. */
export const destinationImageCredits = destinations
  .filter((d) => d.image || d.gallery)
  .map((d) => {
    const credits = [d.image, ...(d.gallery ?? [])]
      .filter((x): x is DestImage => Boolean(x))
      .map((x) => x.credit);
    return { name: d.name, credit: Array.from(new Set(credits)).join("; ") };
  });

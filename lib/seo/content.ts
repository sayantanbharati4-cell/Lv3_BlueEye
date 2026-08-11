import { siteConfig } from "@/lib/config/site";

const bookingUseCases = [
  "weddings and sangeet ceremonies",
  "corporate events and galas",
  "college festivals and fests",
  "private parties and celebrations",
  "social gatherings and community events",
];

const benefitPhrases = [
  "100% verified artists with proven track records",
  "direct booking at lowest-commission pricing",
  "dedicated concierge support throughout your event",
  "hassle-free contract and logistics management",
];

function pick<T>(arr: T[], count: number): T[] {
  return arr.slice(0, count);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getCategoryEventTypes(category: string): string[] {
  const lower = category.toLowerCase();
  if (lower.includes("dj") || lower.includes("music") || lower.includes("band"))
    return ["wedding receptions", "corporate parties", "college fests", "nightclub events"];
  if (lower.includes("comed") || lower.includes("anchor") || lower.includes("emcee"))
    return ["corporate events", "award ceremonies", "college fests", "stand-up nights"];
  if (lower.includes("dancer") || lower.includes("dance"))
    return ["wedding sangeet", "corporate events", "stage shows", "festival celebrations"];
  return ["weddings", "corporate events", "private parties", "college festivals"];
}

function getCategoryArtistTerms(category: string): string[] {
  const lower = category.toLowerCase();
  if (lower.includes("dj")) return ["DJs", "disc jockeys", "turntablists", "electronic music artists"];
  if (lower.includes("singer") || lower.includes("vocal")) return ["singers", "vocalists", "playback artists", "live performers"];
  if (lower.includes("band") || lower.includes("music")) return ["live bands", "music groups", "ensembles", "instrumentalists"];
  if (lower.includes("comed")) return ["stand-up comedians", "comedy artists", "humorists", "comedy performers"];
  if (lower.includes("dancer") || lower.includes("dance")) return ["dancers", "dance troupes", "choreographers", "dance performers"];
  if (lower.includes("anchor") || lower.includes("emcee")) return ["anchors", "emcees", "hosts", "event presenters"];
  return [`${category} artists`, `${category} performers`, `${category} professionals`, `${category} talents`];
}

function getCityEventScene(city: string): string {
  const cityLower = city.toLowerCase();
  const scenes: Record<string, string> = {
    mumbai: "Mumbai, the city of dreams, is India's entertainment capital — a magnet for Bollywood playback singers, chart-topping DJs, and television celebrities. With its thriving wedding circuit, corporate galas, and nightlife venues, the city demands world-class live entertainment year-round.",
    delhi: "Delhi NCR is one of India's largest entertainment markets, hosting thousands of weddings, corporate events, and cultural festivals every year. From luxury hotel ballrooms in Lutyens' Delhi to farmhouse weddings in the city's outskirts, the capital's event scene is unmatched in scale and grandeur.",
    bangalore: "Bangalore (Bengaluru) is India's startup capital with a young, music-loving population. Its pub culture, tech-company annual events, and multi-venue wedding scene drive constant demand for live bands, DJs, and stand-up comedians — making it one of the country's most dynamic entertainment markets.",
    hyderabad: "Hyderabad blends royal Nizami heritage with a booming IT corridor, creating a vibrant events landscape. Grand wedding receptions, tech summits, and film-industry gatherings all contribute to a thriving market for premium artist bookings.",
    chennai: "Chennai is India's cultural capital of music and cinema, steeped in Carnatic tradition and a flourishing film industry. The city's weddings, music sabhas, and corporate events consistently feature top-tier vocalists, instrumentalists, and anchor talent.",
    kolkata: "Kolkata — the City of Joy — has a profound cultural renaissance rooted in literature, music, and theatre. From Durga Puja celebrations to aristocratic Bengali weddings, the city's event calendar is rich, diverse, and deeply appreciative of live performance.",
    pune: "Pune's youthful energy — fueled by its universities, IT parks, and arts scene — makes it a thriving market for concerts, college fests, and corporate events. The city is home to a strong independent music and comedy circuit.",
    chandigarh: "Chandigarh, the capital of Punjab and Haryana, is a wedding-industry powerhouse. Destination weddings, luxury farmhouse receptions, and sangeet nights across the Tricity region create steady, high-value demand for singers, DJs, and anchors.",
    jaipur: "Jaipur's royal heritage and booming wedding tourism make it one of India's most lucrative venues for premium artist bookings. Palace weddings, heritage venues, and international events attract top-tier music and entertainment year-round.",
    lucknow: "Lucknow, the cultural heart of Awadh, values refined taste in music and celebration. Its growing corporate sector and wedding scene demand high-quality classical-contemporary crossover talent and polished event entertainment.",
    ahmedabad: "Ahmedabad — the business hub of Gujarat — pairs a thriving corporate culture with deep-rooted celebration traditions. From Navratri to grand wedding receptions, the city offers consistent demand for live performers and DJs.",
    goa: "Goa, India's beach-party capital, is a magnet for destination weddings, corporate retreats, and music festivals. The state hosts some of the country's biggest events, attracting international-standard DJs, bands, and entertainers.",
    panaji: "Panaji and North Goa are the epicentre of India's coastal entertainment scene, hosting destination weddings, beach parties, and festival lineups that draw artists from across the country and abroad.",
    guwahati: "Guwahati, the gateway to Northeast India, is the region's largest cultural and commercial hub. A lively festival and wedding circuit, combined with a growing corporate landscape, fuels demand for local and national talent alike.",
    kochi: "Kochi pairs Kerala's rich performing-arts heritage with a cosmopolitan, port-city energy. Christian wedding bands, sangeet celebrations, and corporate events make it a unique and rewarding market for entertainers.",
    indore: "Indore, India's cleanest city, has a booming wedding industry and a vibrant food-and-culture scene. Corporate events, marquee weddings, and college fests across MP's commercial capital keep artist demand consistently high.",
    nagpur: "Nagpur, the orange city at India's geographic centre, is a growing corporate and wedding market. Its appetising blend of tradition and modernity makes it a reliable hub for event entertainment in central India.",
    ludhiana: "Ludhiana is a heavyweight in Punjab's elaborate wedding circuit. Grand sangeet ceremonies, baraat processions, and multi-day receptions here rely heavily on live singers, DJs, and dhol talent.",
    bhopal: "Bhopal, the capital of Madhya Pradesh, merges lakeside charm with royal Nizami and Rajput influences. Pop's growing weddings, conventions, and cultural events create steady work for entertainers.",
    surat: "Surat's diamond-and-textile wealth powers one of Gujarat's most extravagant wedding circuits. High-budget celebrations and a fast-growing corporate scene make it a valuable market for premium artists.",
    jodhpur: "Jodhpur, the Blue City, is a premier destination-wedding venue with its majestic forts and palaces. Heritage properties host lavish celebrations that consistently feature top-tier Indian and international entertainment.",
    varanasi: "Varanasi, one of the world's oldest living cities, is the soul of Indian classical music. Its spiritual, cultural, and wedding events demand everything from traditional ghazal singers to contemporary wedding bands.",
    kanpur: "Kanpur, a major industrial city in Uttar Pradesh, has a bustling wedding and corporate circuit. Its growing appetite for live music and entertainment presents solid opportunities for performing artists.",
    patna: "Patna, the capital of Bihar, is home to a rising wedding and celebration culture. Grand receptions and corporate functions across the city increasingly seek professional singers, DJs, and anchors.",
    shimla: "Shimla, the Queen of Hills, is one of India's favourite wedding and honeymoon destinations. Hill-station weddings, resort events, and corporate retreats in Himachal's capital create steady demand for versatile artists.",
    nashik: "Nashik, a fast-growing city near Mumbai, combines a strong wedding circuit with vineyards, festivals, and a lively corporate events scene — a rising market for live entertainment.",
    amritsar: "Amritsar, the spiritual heart of Punjab, hosts some of the region's grandest weddings and religious-cultural celebrations, with a strong appetite for live music and dhol-based entertainment.",
    dehradun: "Dehradun, the capital of Uttarakhand, is a picturesque wedding and corporate destination. Resorts and venues across the Doon Valley create consistent work for bands, DJs, and emcees.",
    rajkot: "Rajkot, a business hub in Saurashtra, has an active wedding and Garba-Navratri culture. The city's events market offers dependable demand for singers, anchors, and live bands.",
    ranchi: "Ranchi, the capital of Jharkhand, is witnessing rapid growth in weddings, college fests, and corporate events — an emerging market for professional entertainers.",
    noida: "Noida, Delhi NCR's fastest-growing satellite city, is home to huge corporate campuses, luxury banquet halls, and a vibrant wedding scene — a major driver of entertainment bookings.",
  };
  return scenes[cityLower] || `${capitalize(city)} has a growing entertainment and events scene with increasing demand for professional artist bookings across weddings, corporate events, and private celebrations.`;
}

export function categorySeoContent(category: string, total: number): string {
  const eventTypes = getCategoryEventTypes(category);
  const artistTerms = getCategoryArtistTerms(category);
  const twoUses = pick(bookingUseCases, 2);
  const twoBenefits = pick(benefitPhrases, 2);

  return (
    `Looking to book top-tier ${category.toLowerCase()} performers for your next event? ${siteConfig.name} connects you with ${total > 0 ? `over ${total} verified` : "professional"} ${artistTerms[0].toLowerCase()} across India. ` +
    `Whether you need entertainment for ${twoUses[0]}, ${twoUses[1]}, or any special occasion, our curated roster of ${category.toLowerCase()} talent ensures you find the perfect match for your event's theme, budget, and audience.` +
    `\n\n` +
    `${artistTerms[1]} bring energy, artistry, and unforgettable moments to every stage. From ${eventTypes[0]} to ${eventTypes[1]}, our ${category.toLowerCase()} professionals have the experience and versatility to elevate your event. ` +
    `We carefully vet each artist for professional reliability, performance quality, and audience engagement — so you can book with complete confidence.` +
    `\n\n` +
    `Why choose ${siteConfig.name} for hiring ${category.toLowerCase()} talent? ` +
    `${capitalize(twoBenefits[0])}. ${capitalize(twoBenefits[1])}. ` +
    `Plus, our dedicated booking team provides personalized recommendations, transparent pricing, and end-to-end coordination — from first inquiry to final bow.` +
    `\n\n` +
    `Browse our complete collection of ${category.toLowerCase()} artists below, filter by city or budget, and submit a booking request. ` +
    `Our team typically responds within 24 hours with availability, customized pricing packages, and expert guidance to make your event truly spectacular.`
  );
}

export function citySeoContent(city: string, total: number): string {
  const scene = getCityEventScene(city);
  const twoBenefits = pick(benefitPhrases, 2);

  return (
    `${scene} ` +
    `${siteConfig.name} features ${total > 0 ? `${total}+ verified` : "a wide selection of verified"} performers based in or available in ${capitalize(city)} — including singers, DJs, comedians, bands, dancers, anchors, and more.` +
    `\n\n` +
    `Whether you're planning a wedding celebration, corporate gala, college festival, or private party in ${capitalize(city)}, finding the right entertainment is crucial for creating memorable experiences. ` +
    `Our platform makes it easy to discover, compare, and book ${city}-based artists who understand the local audience and event landscape.` +
    `\n\n` +
    `${capitalize(twoBenefits[0])}. ${capitalize(twoBenefits[1])}. ` +
    `Our ${capitalize(city)} booking team has deep knowledge of the local entertainment scene and can help match you with artists who fit your specific requirements, venue, and budget.` +
    `\n\n` +
    `Browse the full list of performers available in ${capitalize(city)} below. ` +
    `Each artist profile includes performance videos, past event photos, genre specialties, and direct booking options. ` +
    `Submit an enquiry today and let us help make your ${capitalize(city)} event truly unforgettable.`
  );
}

export function categoryMetaDescription(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("singer") || lower.includes("vocal"))
    return `Book verified ${lower} artists for weddings, corporate events, and parties in India. Browse top playback singers, Bollywood vocalists, and independent artists at ${siteConfig.name}.`;
  if (lower.includes("dj"))
    return `Hire professional DJs for weddings, clubs, and corporate events across India. Browse verified disc jockeys, turntablists, and electronic music artists at ${siteConfig.name}.`;
  if (lower.includes("comed") || lower.includes("comic"))
    return `Book stand-up comedians for corporate events, college fests, and private parties in India. Hire verified comedy artists at ${siteConfig.name}.`;
  if (lower.includes("band") || lower.includes("music"))
    return `Hire live bands for weddings, sangeet, and corporate events across India. Browse verified music groups, ensembles, and instrumentalists at ${siteConfig.name}.`;
  if (lower.includes("dancer") || lower.includes("dance"))
    return `Book professional dancers and dance troupes for weddings, sangeet, and events in India. Hire verified choreographers at ${siteConfig.name}.`;
  if (lower.includes("anchor") || lower.includes("emcee"))
    return `Hire professional anchors and emcees for corporate events, award ceremonies, and weddings in India. Book verified hosts at ${siteConfig.name}.`;
  return `Book verified ${lower} artists for weddings, corporate events, and private parties in India. Browse top ${lower} performers at ${siteConfig.name}.`;
}

export function cityMetaDescription(city: string): string {
  return `Find and book top performers in ${city} for weddings, corporate events, and private parties. Browse verified singers, DJs, comedians, bands, and more in ${city} at ${siteConfig.name}.`;
}

const PLURAL_EXCEPTIONS: Record<string, string> = {
  dj: "DJs",
  "dj's": "DJs",
  "celebrity appearance": "Celebrity Appearances",
  "celebrity appearances": "Celebrity Appearances",
  "tv artist": "TV Artists",
  "tv artists": "TV Artists",
  mentalist: "Mentalists",
  chef: "Chefs",
  band: "Bands",
  singer: "Singers",
  comedian: "Comedians",
  rapper: "Rappers",
  speaker: "Speakers",
  dancer: "Dancers",
  anchor: "Anchors",
  instrumentalist: "Instrumentalists",
};

export function pluralizeCategory(category: string): string {
  const lower = category.toLowerCase().trim();
  const exception = PLURAL_EXCEPTIONS[lower];
  if (exception) return exception;
  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) {
    return category.slice(0, -1) + "ies";
  }
  if (lower.endsWith("s") || lower.endsWith("x") || lower.endsWith("ch") || lower.endsWith("sh")) {
    return category + "es";
  }
  return category + "s";
}

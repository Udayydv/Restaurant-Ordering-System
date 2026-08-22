/**
 * All brand / business content lives here so it can be edited in one place.
 * Nothing in the UI hardcodes restaurant details.
 */

export const restaurant = {
  legalName: "Tripathi Restaurant & Caterers",
  brandName: "Tripathi Veg Restaurant",
  logoTop: "TRIPATHI",
  logoBottom: "Veg Restaurant",
  tagline: "Ghar Jaisa Swad, Ab Ghar Tak ❤️",
  subTagline: "100% Pure Veg • Fresh • Hygienic • Authentic Taste",
  promo: "Order Direct • Fresh Food • Only ₹5 Delivery",
  deliveryFee: 5,
  // EDITABLE: add the real street address here.
  address: "Adarsh Nagar Colony, Roza",
  // EDITABLE: paste a Google Maps embed URL / place link here.
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Tripathi+Restaurant+%26+Caterers",
  openingHours: "Every day • 8:00 AM – 10:30 PM",
  phones: ["9695968758", "8853281356"],
  social: [
    { label: "WhatsApp", href: "https://wa.me/919695968758" },
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
  ],
} as const;

export const trustBadges = [
  { icon: "🥗", label: "100% Pure Veg" },
  { icon: "🔥", label: "Freshly Prepared" },
  { icon: "⭐", label: "Customer Favourite" },
] as const;

export const whyDirect = [
  {
    icon: "🚴",
    title: "Only ₹5 Delivery",
    text: "No heavy platform delivery charges. Flat ₹5 anywhere nearby.",
  },
  {
    icon: "💰",
    title: "Direct Restaurant Pricing",
    text: "You pay kitchen price — no aggregator commission added on top.",
  },
  {
    icon: "🍛",
    title: "Freshly Prepared Food",
    text: "Every order is cooked after you place it. Never pre-packed.",
  },
  {
    icon: "❤️",
    title: "Support Your Local Restaurant",
    text: "Ordering direct keeps your neighbourhood kitchen running.",
  },
] as const;

export const cateringOccasions = [
  { icon: "🎂", label: "Birthday Party" },
  { icon: "💍", label: "Anniversary Party" },
  { icon: "🏢", label: "Office Party" },
  { icon: "🎉", label: "Kitty Party" },
  { icon: "👨‍👩‍👧‍👦", label: "Family Gathering" },
  { icon: "🎊", label: "Functions" },
  { icon: "🏠", label: "Doorstep Catering" },
  { icon: "🎪", label: "Events" },
] as const;

/** EDITABLE: catering package prices are indicative and can be changed anytime. */
export const cateringPackages = {
  standard: [
    { people: 6, price: 999 },
    { people: 10, price: 1650 },
    { people: 20, price: 3300 },
    { people: 50, price: 8000 },
  ],
  premium: [
    { people: 6, price: 1499 },
    { people: 10, price: 2499 },
    { people: 20, price: 4499 },
    { people: 50, price: 12499 },
  ],
} as const;

/** EDITABLE: catering menu options. */
export const cateringMenu = [
  "Dal Fry",
  "Dal Makhani",
  "Kadai Paneer",
  "Paneer Butter Masala",
  "Paneer Lababdar",
  "Mixed Veg",
  "Jeera Rice",
  "Matar Pulao",
  "Tawa Roti",
  "Plain Puri",
  "Raita",
  "Salad",
  "Papad",
] as const;

export const offers = [
  {
    icon: "🔥",
    title: "Bumper Catering Offer",
    text: "Full vegetarian catering for parties & functions, starting at ₹999 for 6 people.",
    cta: { label: "Get Catering Quote", to: "/catering" },
    accent: "tomato",
  },
  {
    icon: "🎉",
    title: "First Order Offer",
    text: "New here? Order direct today and taste ghar jaisa khana — freshly cooked.",
    cta: { label: "Order Now", to: "/menu" },
    accent: "saffron",
  },
  {
    icon: "🚴",
    title: "Flat ₹5 Delivery",
    text: "Every single order, every single day. No hidden delivery charge.",
    cta: { label: "Browse Menu", to: "/menu" },
    accent: "leaf",
  },
  {
    icon: "🍛",
    title: "Thali Offers",
    text: "Complete meals from ₹60. Ghar Ki Thali, Special Thali & Super Deluxe Thali.",
    cta: { label: "See Thalis", to: "/menu" },
    accent: "saffron",
  },
] as const;

export const reviews = [
  {
    name: "Ankit Sharma",
    text: "Fresh, home-style food and quick delivery every time. Tripathi has become our go-to for weeknight dinners.",
    rating: 5,
  },
  {
    name: "Priya Verma",
    text: "The thali is so good — generous portions and everything tastes like it's made with real care. Highly recommend!",
    rating: 5,
  },
  {
    name: "Rahul Gupta",
    text: "Ordered for a small family get-together and everyone loved it. Warm service and great value for money.",
    rating: 4,
  },
] as const;

export const telHref = (phone: string) => `tel:+91${phone}`;
export const rupees = (n: number) => `₹${n}`;

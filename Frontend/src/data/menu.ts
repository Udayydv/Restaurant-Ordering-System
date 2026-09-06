import alooDoPyaza from "@/assets/dishes/aloo-do-pyaza.jpg";
import alooDum from "@/assets/dishes/aloo-dum.jpg";
import alooMatar from "@/assets/dishes/aloo-matar.jpg";
import alooParatha from "@/assets/dishes/aloo-paratha.jpg";
import boondiRaita from "@/assets/dishes/boondi-raita.jpg";
import butterRoti from "@/assets/dishes/butter-roti.jpg";
import charitravanChai from "@/assets/dishes/charitravan-chai.jpg";
import chilliPaneer from "@/assets/dishes/chilli-paneer.jpg";
import chilliPotato from "@/assets/dishes/chilli-potato.jpg";
import chilliSoya from "@/assets/dishes/chilli-soya.jpg";
import choleBhature from "@/assets/dishes/chole-bhature.jpg";
import choleChawal from "@/assets/dishes/chole-chawal.jpg";
import coffee from "@/assets/dishes/coffee.jpg";
import dalChawal from "@/assets/dishes/dal-chawal.jpg";
import dalPunjabi from "@/assets/dishes/dal-punjabi.jpg";
import friedRice from "@/assets/dishes/fried-rice.jpg";
import jeeraAloo from "@/assets/dishes/jeera-aloo.jpg";
import jeeraRice from "@/assets/dishes/jeera-rice.jpg";
import kadaiMushroom from "@/assets/dishes/kadai-mushroom.jpg";
import kadaiPaneer from "@/assets/dishes/kadai-paneer.jpg";
import kheeraRaita from "@/assets/dishes/kheera-raita.jpg";
import malaiKofta from "@/assets/dishes/malai-kofta.jpg";
import malaiPaneer from "@/assets/dishes/malai-paneer.jpg";
import masalaAloo from "@/assets/dishes/masala-aloo.jpg";
import masalaChaap from "@/assets/dishes/masala-chaap.jpg";
import masalaMaggi from "@/assets/dishes/masala-maggi.jpg";
import matarPaneer from "@/assets/dishes/matar-paneer.jpg";
import matarPulao from "@/assets/dishes/matar-pulao.jpg";
import mixVeg from "@/assets/dishes/mix-veg.jpg";
import mughlaiPaneer from "@/assets/dishes/mughlai-paneer.jpg";
import mushroomDoPyaza from "@/assets/dishes/mushroom-do-pyaza.jpg";
import mushroomMasala from "@/assets/dishes/mushroom-masala.jpg";
import mushroomMatar from "@/assets/dishes/mushroom-matar.jpg";
import paneerBhujia from "@/assets/dishes/paneer-bhujia.jpg";
import paneerButterMasala from "@/assets/dishes/paneer-butter-masala.jpg";
import paneerChangezi from "@/assets/dishes/paneer-changezi.jpg";
import paneerChowmein from "@/assets/dishes/paneer-chowmein.jpg";
import paneerDoPyaza from "@/assets/dishes/paneer-do-pyaza.jpg";
import paneerKaliMirch from "@/assets/dishes/paneer-kali-mirch.jpg";
import paneerKorma from "@/assets/dishes/paneer-korma.jpg";
import paneerKurkure from "@/assets/dishes/paneer-kurkure.jpg";
import paneerMaggi from "@/assets/dishes/paneer-maggi.jpg";
import paneerManchurian from "@/assets/dishes/paneer-manchurian.jpg";
import paneerPakoda from "@/assets/dishes/paneer-pakoda.jpg";
import paneerParatha from "@/assets/dishes/paneer-paratha.jpg";
import paneerPulao from "@/assets/dishes/paneer-pulao.jpg";
import papadKorma from "@/assets/dishes/papad-korma.jpg";
import plainMaggi from "@/assets/dishes/plain-maggi.jpg";
import plainParatha from "@/assets/dishes/plain-paratha.jpg";
import plainPuri from "@/assets/dishes/plain-puri.jpg";
import plainRice from "@/assets/dishes/plain-rice.jpg";
import puriSabzi from "@/assets/dishes/puri-sabzi.jpg";
import pyazPakoda from "@/assets/dishes/pyaz-pakoda.jpg";
import pyazParatha from "@/assets/dishes/pyaz-paratha.jpg";
import rajmaChawal from "@/assets/dishes/rajma-chawal.jpg";
import sabziRoti from "@/assets/dishes/sabzi-roti.jpg";
import sevBhaji from "@/assets/dishes/sev-bhaji.jpg";
import shahiPaneer from "@/assets/dishes/shahi-paneer.jpg";
import specialTea from "@/assets/dishes/special-tea.jpg";
import tawaRoti from "@/assets/dishes/tawa-roti.jpg";
import tea from "@/assets/dishes/tea.jpg";
import thaliDeluxe from "@/assets/dishes/thali-deluxe.jpg";
import thaliGhar from "@/assets/dishes/thali-ghar.jpg";
import thaliSada from "@/assets/dishes/thali-sada.jpg";
import thaliSpecial from "@/assets/dishes/thali-special.jpg";
import vegChowmein from "@/assets/dishes/veg-chowmein.jpg";
import vegKadai from "@/assets/dishes/veg-kadai.jpg";
import vegKofta from "@/assets/dishes/veg-kofta.jpg";
import vegManchurian from "@/assets/dishes/veg-manchurian.jpg";
import vegPulao from "@/assets/dishes/veg-pulao.jpg";
import vegRaita from "@/assets/dishes/veg-raita.jpg";

export type PriceType = "regular" | "half" | "full";

export type Variant = {
  label: "Regular" | "Half" | "Full";
  price: number | null;
};

export type MenuItem = {
  // Stable curated slug used for display/content lookups.
  id: string;
  // Real MongoDB product id loaded from the backend when available.
  // Cart checkout should prefer this over the static slug.
  backendId?: string;
  name: string;
  description: string;
  ingredients: string;
  image: string;
  categories: string[];
  variants: Variant[];
  rating: number;
  tags?: string[];
};

export type Category = { id: string; label: string; icon: string };

export const categories: Category[] = [
  { id: "main-course", label: "Main Course", icon: "🍛" },
  { id: "raita", label: "Raita", icon: "🥛" },
  { id: "roti", label: "Roti & Poori", icon: "🫓" },
  { id: "rice", label: "Rice & Biryani", icon: "🍚" },
  { id: "thali", label: "Thalis", icon: "🍱" },
  { id: "combo", label: "Combo", icon: "🥘" },
  { id: "paratha", label: "Paratha", icon: "🫓" },
  { id: "snacks", label: "Snacks & Beverages", icon: "🍟" },
  { id: "chinese", label: "Chinese", icon: "🍜" },
];

const dishImages = {
  "aloo-do-pyaza": alooDoPyaza,
  "aloo-dum": alooDum,
  "aloo-matar": alooMatar,
  "aloo-paratha": alooParatha,
  "boondi-raita": boondiRaita,
  "butter-roti": butterRoti,
  "charitravan-chai": charitravanChai,
  "chilli-paneer": chilliPaneer,
  "chilli-potato": chilliPotato,
  "chilli-soya": chilliSoya,
  "chole-bhature": choleBhature,
  "chole-chawal": choleChawal,
  "coffee": coffee,
  "dal-chawal": dalChawal,
  "dal-punjabi": dalPunjabi,
  "fried-rice": friedRice,
  "jeera-aloo": jeeraAloo,
  "jeera-rice": jeeraRice,
  "kadai-mushroom": kadaiMushroom,
  "kadai-paneer": kadaiPaneer,
  "kheera-raita": kheeraRaita,
  "malai-kofta": malaiKofta,
  "malai-paneer": malaiPaneer,
  "masala-aloo": masalaAloo,
  "masala-chaap": masalaChaap,
  "masala-maggi": masalaMaggi,
  "matar-paneer": matarPaneer,
  "matar-pulao": matarPulao,
  "mix-veg": mixVeg,
  "mughlai-paneer": mughlaiPaneer,
  "mushroom-do-pyaza": mushroomDoPyaza,
  "mushroom-masala": mushroomMasala,
  "mushroom-matar": mushroomMatar,
  "paneer-bhujia": paneerBhujia,
  "paneer-butter-masala": paneerButterMasala,
  "paneer-changezi": paneerChangezi,
  "paneer-chowmein": paneerChowmein,
  "paneer-do-pyaza": paneerDoPyaza,
  "paneer-kali-mirch": paneerKaliMirch,
  "paneer-korma": paneerKorma,
  "paneer-kurkure": paneerKurkure,
  "paneer-maggi": paneerMaggi,
  "paneer-manchurian": paneerManchurian,
  "paneer-pakoda": paneerPakoda,
  "paneer-paratha": paneerParatha,
  "paneer-pulao": paneerPulao,
  "papad-korma": papadKorma,
  "plain-maggi": plainMaggi,
  "plain-paratha": plainParatha,
  "plain-puri": plainPuri,
  "plain-rice": plainRice,
  "puri-sabzi": puriSabzi,
  "pyaz-pakoda": pyazPakoda,
  "pyaz-paratha": pyazParatha,
  "rajma-chawal": rajmaChawal,
  "sabzi-roti": sabziRoti,
  "sev-bhaji": sevBhaji,
  "shahi-paneer": shahiPaneer,
  "special-tea": specialTea,
  "tawa-roti": tawaRoti,
  "tea": tea,
  "thali-deluxe": thaliDeluxe,
  "thali-ghar": thaliGhar,
  "thali-sada": thaliSada,
  "thali-special": thaliSpecial,
  "veg-chowmein": vegChowmein,
  "veg-kadai": vegKadai,
  "veg-kofta": vegKofta,
  "veg-manchurian": vegManchurian,
  "veg-pulao": vegPulao,
  "veg-raita": vegRaita,
} as const;

/*
 * Menu prices synced from the restaurant menu images on 2026-09-06.
 * Customer-facing portion policy:
 *   - one-price dishes => Regular
 *   - multi-price dishes => Half / Full ONLY
 *   - Quarter and Family are intentionally not supported anywhere.
 * All supplied menu prices have ₹10 added, except Tawa Roti and Butter Roti.
 */
export const menu: MenuItem[] = [
  {
    id: "handi-paneer",
    name: "Handi Paneer",
    description: "Freshly cooked Handi Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["shahi-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 270 }, { label: "Full", price: 480 }],
    rating: 4.7,
  },
  {
    id: "paneer-lababdar",
    name: "Paneer Lababdar",
    description: "Freshly cooked Paneer Lababdar prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-butter-masala"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 180 }, { label: "Full", price: 330 }],
    rating: 4.7,
  },
  {
    id: "malai-paneer",
    name: "Malai Paneer",
    description: "Freshly cooked Malai Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["malai-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 180 }, { label: "Full", price: 330 }],
    rating: 4.7,
  },
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description: "Freshly cooked Paneer Butter Masala prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-butter-masala"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 160 }, { label: "Full", price: 270 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "kadai-paneer",
    name: "Kadai Paneer",
    description: "Freshly cooked Kadai Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["kadai-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 260 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "paneer-korma",
    name: "Paneer Korma",
    description: "Freshly cooked Paneer Korma prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-korma"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 270 }],
    rating: 4.7,
  },
  {
    id: "paneer-kali-mirch",
    name: "Paneer Kali Mirch",
    description: "Freshly cooked Paneer Kali Mirch prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-kali-mirch"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 140 }, { label: "Full", price: 240 }],
    rating: 4.7,
  },
  {
    id: "paneer-changezi",
    name: "Paneer Changezi",
    description: "Freshly cooked Paneer Changezi prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-changezi"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 270 }],
    rating: 4.7,
  },
  {
    id: "paneer-bhujia",
    name: "Paneer Bhujia",
    description: "Freshly cooked Paneer Bhujia prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-bhujia"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 160 }, { label: "Full", price: 270 }],
    rating: 4.7,
  },
  {
    id: "matar-paneer",
    name: "Matar Paneer",
    description: "Freshly cooked Matar Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["matar-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "paneer-do-pyaza",
    name: "Paneer Do Pyaza",
    description: "Freshly cooked Paneer Do Pyaza prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-do-pyaza"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }],
    rating: 4.7,
  },
  {
    id: "shahi-paneer",
    name: "Shahi Paneer",
    description: "Freshly cooked Shahi Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["shahi-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 140 }, { label: "Full", price: 250 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "mughlai-paneer",
    name: "Mughlai Paneer",
    description: "Freshly cooked Mughlai Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["mughlai-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 260 }],
    rating: 4.7,
  },
  {
    id: "dilli-paneer",
    name: "Dilli Paneer",
    description: "Freshly cooked Dilli Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chilli-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 170 }, { label: "Full", price: 290 }],
    rating: 4.7,
  },
  {
    id: "tawa-paneer",
    name: "Tawa Paneer",
    description: "Freshly cooked Tawa Paneer prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["kadai-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 80 }, { label: "Full", price: 140 }],
    rating: 4.7,
  },
  {
    id: "tawa-fry-butter",
    name: "Tawa Fry Butter",
    description: "Freshly cooked Tawa Fry Butter prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-butter-masala"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 150 }],
    rating: 4.7,
  },
  {
    id: "tawa-shahi",
    name: "Tawa Shahi",
    description: "Freshly cooked Tawa Shahi prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["shahi-paneer"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 160 }, { label: "Full", price: 270 }],
    rating: 4.7,
  },
  {
    id: "tawa-punjabi-tadka",
    name: "Tawa Punjabi Tadka",
    description: "Freshly cooked Tawa Punjabi Tadka prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["dal-punjabi"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 150 }],
    rating: 4.7,
  },
  {
    id: "mix-veg",
    name: "Mix Veg",
    description: "Freshly cooked Mix Veg prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["mix-veg"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 140 }, { label: "Full", price: 240 }],
    rating: 4.7,
  },
  {
    id: "veg-kadai",
    name: "Veg Kadai",
    description: "Freshly cooked Veg Kadai prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-kadai"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 260 }],
    rating: 4.7,
  },
  {
    id: "jeera-aloo",
    name: "Jeera Aloo",
    description: "Freshly cooked Jeera Aloo prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["jeera-aloo"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 120 }],
    rating: 4.7,
  },
  {
    id: "aloo-do-pyaza",
    name: "Aloo Do Pyaza",
    description: "Freshly cooked Aloo Do Pyaza prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["aloo-do-pyaza"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }],
    rating: 4.7,
  },
  {
    id: "masala-aloo",
    name: "Masala Aloo",
    description: "Freshly cooked Masala Aloo prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["masala-aloo"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 120 }],
    rating: 4.7,
  },
  {
    id: "aloo-dum",
    name: "Aloo Dum",
    description: "Freshly cooked Aloo Dum prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["aloo-dum"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 110 }, { label: "Full", price: 210 }],
    rating: 4.7,
  },
  {
    id: "aloo-matar",
    name: "Aloo Matar",
    description: "Freshly cooked Aloo Matar prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["aloo-matar"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 120 }],
    rating: 4.7,
  },
  {
    id: "chole-masala",
    name: "Chole Masala",
    description: "Freshly cooked Chole Masala prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chole-bhature"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }],
    rating: 4.7,
  },
  {
    id: "veg-kofta",
    name: "Veg Kofta",
    description: "Freshly cooked Veg Kofta prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-kofta"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 110 }, { label: "Full", price: 200 }],
    rating: 4.7,
  },
  {
    id: "malai-kofta",
    name: "Malai Kofta",
    description: "Freshly cooked Malai Kofta prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["malai-kofta"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 160 }, { label: "Full", price: 270 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "mushroom-masala",
    name: "Mushroom Masala",
    description: "Freshly cooked Mushroom Masala prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["mushroom-masala"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 260 }],
    rating: 4.7,
  },
  {
    id: "mushroom-matar",
    name: "Mushroom Matar",
    description: "Freshly cooked Mushroom Matar prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["mushroom-matar"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 140 }, { label: "Full", price: 230 }],
    rating: 4.7,
  },
  {
    id: "kadai-mushroom",
    name: "Kadai Mushroom",
    description: "Freshly cooked Kadai Mushroom prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["kadai-mushroom"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 140 }, { label: "Full", price: 250 }],
    rating: 4.7,
  },
  {
    id: "mushroom-do-pyaza",
    name: "Mushroom Do Pyaza",
    description: "Freshly cooked Mushroom Do Pyaza prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["mushroom-do-pyaza"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }],
    rating: 4.7,
  },
  {
    id: "papad-korma",
    name: "Papad Korma",
    description: "Freshly cooked Papad Korma prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["papad-korma"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 120 }, { label: "Full", price: 210 }],
    rating: 4.7,
  },
  {
    id: "masala-chaap",
    name: "Masala Chaap",
    description: "Freshly cooked Masala Chaap prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["masala-chaap"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }],
    rating: 4.7,
  },
  {
    id: "sev-bhaji",
    name: "Sev Bhaji",
    description: "Freshly cooked Sev Bhaji prepared in our pure-veg kitchen.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["sev-bhaji"],
    categories: ["main-course"],
    variants: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }],
    rating: 4.7,
  },
  {
    id: "dahi-raita",
    name: "Dahi Raita",
    description: "Fresh and cooling Dahi Raita, prepared to order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["boondi-raita"],
    categories: ["raita"],
    variants: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }],
    rating: 4.7,
  },
  {
    id: "veg-raita",
    name: "Veg Raita",
    description: "Fresh and cooling Veg Raita, prepared to order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-raita"],
    categories: ["raita"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 150 }],
    rating: 4.7,
  },
  {
    id: "kheera-raita",
    name: "Kheera Raita",
    description: "Fresh and cooling Kheera Raita, prepared to order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["kheera-raita"],
    categories: ["raita"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 120 }],
    rating: 4.7,
  },
  {
    id: "tawa-roti",
    name: "Tawa Roti",
    description: "Fresh Tawa Roti prepared hot for your order.",
    ingredients: "Wheat flour",
    image: dishImages["tawa-roti"],
    categories: ["roti"],
    variants: [{ label: "Regular", price: 6 }],
    rating: 4.7,
  },
  {
    id: "butter-roti",
    name: "Butter Roti",
    description: "Fresh Butter Roti prepared hot for your order.",
    ingredients: "Wheat flour, butter",
    image: dishImages["butter-roti"],
    categories: ["roti"],
    variants: [{ label: "Regular", price: 10 }],
    rating: 4.7,
  },
  {
    id: "plain-puri",
    name: "Plain Puri",
    description: "Fresh Plain Puri prepared hot for your order.",
    ingredients: "Wheat flour, oil",
    image: dishImages["plain-puri"],
    categories: ["roti"],
    variants: [{ label: "Regular", price: 18 }],
    rating: 4.7,
  },
  {
    id: "plain-rice",
    name: "Plain Chawal",
    description: "Freshly cooked Plain Chawal, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["plain-rice"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }],
    rating: 4.7,
  },
  {
    id: "jeera-rice",
    name: "Jeera Chawal",
    description: "Freshly cooked Jeera Chawal, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["jeera-rice"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 120 }],
    rating: 4.7,
  },
  {
    id: "veg-pulao",
    name: "Veg Pulao",
    description: "Freshly cooked Veg Pulao, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-pulao"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 140 }],
    rating: 4.7,
  },
  {
    id: "veg-biryani",
    name: "Veg Biryani",
    description: "Freshly cooked Veg Biryani, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-pulao"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 100 }, { label: "Full", price: 160 }],
    rating: 4.7,
  },
  {
    id: "fried-rice",
    name: "Fried Chawal",
    description: "Freshly cooked Fried Chawal, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["fried-rice"],
    categories: ["rice", "chinese"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 150 }],
    rating: 4.7,
  },
  {
    id: "matar-pulao",
    name: "Matar Pulao",
    description: "Freshly cooked Matar Pulao, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["matar-pulao"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 140 }],
    rating: 4.7,
  },
  {
    id: "paneer-pulao",
    name: "Paneer Pulao",
    description: "Freshly cooked Paneer Pulao, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-pulao"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 110 }, { label: "Full", price: 180 }],
    rating: 4.7,
  },
  {
    id: "shahi-biryani",
    name: "Shahi Biryani",
    description: "Freshly cooked Shahi Biryani, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-pulao"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }],
    rating: 4.7,
  },
  {
    id: "hyderabadi-dum-veg-biryani",
    name: "Hyderabadi Dum Veg Biryani",
    description: "Freshly cooked Hyderabadi Dum Veg Biryani, aromatic and satisfying.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-pulao"],
    categories: ["rice"],
    variants: [{ label: "Half", price: 150 }, { label: "Full", price: 260 }],
    rating: 4.7,
  },
  {
    id: "ghar-ki-thali",
    name: "Ghar Ki Thali",
    description: "Dal, sabzi, 4 roti, salad and achar.",
    ingredients: "Dal, sabzi, 4 roti, salad, achar",
    image: dishImages["thali-ghar"],
    categories: ["thali"],
    variants: [{ label: "Regular", price: 90 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "sada-bhojan-thali",
    name: "Sada Bhojan Thali",
    description: "Dal, sabzi, chawal, 4 roti, salad, achar and papad.",
    ingredients: "Dal, sabzi, chawal, 4 roti, salad, achar, papad",
    image: dishImages["thali-sada"],
    categories: ["thali"],
    variants: [{ label: "Regular", price: 120 }],
    rating: 4.7,
  },
  {
    id: "special-thali",
    name: "Special Thali",
    description: "Dal fry, matar paneer, chawal, roti, 1 sweet, salad, achar and papad.",
    ingredients: "Dal fry, matar paneer, chawal, roti, sweet, salad, achar, papad",
    image: dishImages["thali-special"],
    categories: ["thali"],
    variants: [{ label: "Regular", price: 140 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "super-deluxe-thali",
    name: "Super Deluxe Thali",
    description: "Dal fry, paneer masala, mix veg, chawal, roti, salad, achar, papad, raita and mithai.",
    ingredients: "Dal fry, paneer masala, mix veg, chawal, roti, salad, achar, papad, raita, mithai",
    image: dishImages["thali-deluxe"],
    categories: ["thali"],
    variants: [{ label: "Regular", price: 180 }],
    rating: 4.7,
  },
  {
    id: "maharaja-thali",
    name: "Maharaja Thali",
    description: "Paneer butter masala, dal fry, mix veg, chawal, roti, salad, achar, papad, raita, mithai and special chutney.",
    ingredients: "Paneer butter masala, dal fry, mix veg, chawal, roti, salad, achar, papad, raita, mithai, special chutney",
    image: dishImages["thali-deluxe"],
    categories: ["thali"],
    variants: [{ label: "Regular", price: 230 }],
    rating: 4.7,
    tags: ["special"],
  },
  {
    id: "rajma-chawal",
    name: "Rajma Chawal",
    description: "Value combo of Rajma Chawal, prepared fresh after you order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["rajma-chawal"],
    categories: ["combo"],
    variants: [{ label: "Regular", price: 70 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "chole-chawal",
    name: "Chole Chawal",
    description: "Value combo of Chole Chawal, prepared fresh after you order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chole-chawal"],
    categories: ["combo"],
    variants: [{ label: "Regular", price: 70 }],
    rating: 4.7,
  },
  {
    id: "dal-chawal",
    name: "Dal Chawal",
    description: "Value combo of Dal Chawal, prepared fresh after you order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["dal-chawal"],
    categories: ["combo"],
    variants: [{ label: "Regular", price: 60 }],
    rating: 4.7,
  },
  {
    id: "puri-sabzi",
    name: "Puri Sabzi",
    description: "Value combo of Puri Sabzi, prepared fresh after you order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["puri-sabzi"],
    categories: ["combo"],
    variants: [{ label: "Regular", price: 60 }],
    rating: 4.7,
  },
  {
    id: "sabzi-4-roti",
    name: "Sabzi + 4 Roti",
    description: "Value combo of Sabzi + 4 Roti, prepared fresh after you order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["sabzi-roti"],
    categories: ["combo"],
    variants: [{ label: "Regular", price: 70 }],
    rating: 4.7,
  },
  {
    id: "dal-4-roti",
    name: "Dal + 4 Roti",
    description: "Value combo of Dal + 4 Roti, prepared fresh after you order.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["sabzi-roti"],
    categories: ["combo"],
    variants: [{ label: "Regular", price: 70 }],
    rating: 4.7,
  },
  {
    id: "aloo-paratha",
    name: "Aloo Paratha",
    description: "Hot Aloo Paratha, freshly cooked on the tawa.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["aloo-paratha"],
    categories: ["paratha"],
    variants: [{ label: "Regular", price: 50 }],
    rating: 4.7,
  },
  {
    id: "pyaz-paratha",
    name: "Pyaz Paratha",
    description: "Hot Pyaz Paratha, freshly cooked on the tawa.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["pyaz-paratha"],
    categories: ["paratha"],
    variants: [{ label: "Regular", price: 50 }],
    rating: 4.7,
  },
  {
    id: "paneer-paratha",
    name: "Paneer Paratha",
    description: "Hot Paneer Paratha, freshly cooked on the tawa.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-paratha"],
    categories: ["paratha"],
    variants: [{ label: "Regular", price: 80 }],
    rating: 4.7,
  },
  {
    id: "plain-paratha",
    name: "Plain Paratha",
    description: "Hot Plain Paratha, freshly cooked on the tawa.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["plain-paratha"],
    categories: ["paratha"],
    variants: [{ label: "Regular", price: 25 }],
    rating: 4.7,
  },
  {
    id: "chole-bhature",
    name: "Chole Bhature",
    description: "Freshly prepared Chole Bhature, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chole-bhature"],
    categories: ["snacks"],
    variants: [{ label: "Regular", price: 70 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "paneer-pakoda",
    name: "Paneer Pakode (5 Pieces)",
    description: "Freshly prepared Paneer Pakode (5 Pieces), perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-pakoda"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 80 }, { label: "Full", price: 140 }],
    rating: 4.7,
  },
  {
    id: "pyaz-pakoda",
    name: "Pyaz Pakode (10 Pieces)",
    description: "Freshly prepared Pyaz Pakode (10 Pieces), perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["pyaz-pakoda"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }],
    rating: 4.7,
  },
  {
    id: "paneer-kurkure",
    name: "Paneer Kurkure (5 Pieces)",
    description: "Freshly prepared Paneer Kurkure (5 Pieces), perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-kurkure"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }],
    rating: 4.7,
  },
  {
    id: "plain-maggi",
    name: "Plain Maggi",
    description: "Freshly prepared Plain Maggi, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["plain-maggi"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 60 }, { label: "Full", price: 100 }],
    rating: 4.7,
  },
  {
    id: "paneer-maggi-masala",
    name: "Paneer Maggi Masala",
    description: "Freshly prepared Paneer Maggi Masala, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-maggi"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }],
    rating: 4.7,
  },
  {
    id: "veg-maggi-masala",
    name: "Veg Maggi Masala",
    description: "Freshly prepared Veg Maggi Masala, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["masala-maggi"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 90 }, { label: "Full", price: 150 }],
    rating: 4.7,
  },
  {
    id: "maggi-masala",
    name: "Maggi Masala",
    description: "Freshly prepared Maggi Masala, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["masala-maggi"],
    categories: ["snacks"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 120 }],
    rating: 4.7,
  },
  {
    id: "tea",
    name: "Tea",
    description: "Freshly prepared Tea, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["tea"],
    categories: ["snacks"],
    variants: [{ label: "Regular", price: 20 }],
    rating: 4.7,
  },
  {
    id: "special-tea",
    name: "Special Tea",
    description: "Freshly prepared Special Tea, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["special-tea"],
    categories: ["snacks"],
    variants: [{ label: "Regular", price: 30 }],
    rating: 4.7,
  },
  {
    id: "chaiwala-chai",
    name: "Chaiwala Chai",
    description: "Freshly prepared Chaiwala Chai, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["charitravan-chai"],
    categories: ["snacks"],
    variants: [{ label: "Regular", price: 25 }],
    rating: 4.7,
  },
  {
    id: "coffee",
    name: "Coffee",
    description: "Freshly prepared Coffee, perfect for a quick bite.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["coffee"],
    categories: ["snacks"],
    variants: [{ label: "Regular", price: 45 }],
    rating: 4.7,
  },
  {
    id: "chilli-paneer",
    name: "Chilli Paneer",
    description: "Freshly prepared Chilli Paneer in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chilli-paneer"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 170 }, { label: "Full", price: 290 }],
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "chilli-soya-chunk",
    name: "Chilli Soya Chunk",
    description: "Freshly prepared Chilli Soya Chunk in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chilli-soya"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 110 }, { label: "Full", price: 190 }],
    rating: 4.7,
  },
  {
    id: "chilli-chutney",
    name: "Chilli Chutney",
    description: "Freshly prepared Chilli Chutney in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["chilli-potato"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 80 }, { label: "Full", price: 130 }],
    rating: 4.7,
  },
  {
    id: "veg-chowmein",
    name: "Veg Chowmein",
    description: "Freshly prepared Veg Chowmein in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-chowmein"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 50 }, { label: "Full", price: 70 }],
    rating: 4.7,
  },
  {
    id: "paneer-chowmein",
    name: "Paneer Chowmein",
    description: "Freshly prepared Paneer Chowmein in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-chowmein"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 70 }, { label: "Full", price: 110 }],
    rating: 4.7,
  },
  {
    id: "veg-manchurian",
    name: "Veg Manchurian",
    description: "Freshly prepared Veg Manchurian in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["veg-manchurian"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 110 }, { label: "Full", price: 180 }],
    rating: 4.7,
  },
  {
    id: "paneer-manchurian",
    name: "Paneer Manchurian",
    description: "Freshly prepared Paneer Manchurian in classic Indo-Chinese style.",
    ingredients: "100% vegetarian ingredients, house spices",
    image: dishImages["paneer-manchurian"],
    categories: ["chinese"],
    variants: [{ label: "Half", price: 130 }, { label: "Full", price: 210 }],
    rating: 4.7,
  },
];

export const thaliContents: Record<string, string[]> = {
  "ghar-ki-thali": ["Dal", "Sabzi", "4 Roti", "Salad", "Achar"],
  "sada-bhojan-thali": ["Dal", "Sabzi", "Chawal", "4 Roti", "Salad", "Achar", "Papad"],
  "special-thali": ["Dal Fry", "Matar Paneer", "Chawal", "Roti", "1 Sweet", "Salad", "Achar", "Papad"],
  "super-deluxe-thali": ["Dal Fry", "Paneer Masala", "Mix Veg", "Chawal", "Roti", "Salad", "Achar", "Papad", "Raita", "Mithai"],
  "maharaja-thali": ["Paneer Butter Masala", "Dal Fry", "Mix Veg", "Chawal", "Roti", "Salad", "Achar", "Papad", "Raita", "Mithai", "Special Chutney"],
};

export const menuById = (id: string) => menu.find((m) => m.id === id);

export const itemsByCategory = (categoryId: string) =>
  menu.filter((m) => m.categories.includes(categoryId));

export const startingPrice = (item: MenuItem) => {
  const prices = item.variants
    .map((x) => x.price)
    .filter((price): price is number => price !== null);
  return prices.length ? Math.min(...prices) : null;
};

export const bestSellers = () => menu.filter((m) => m.tags?.includes("bestseller"));
export const todaysSpecial = () => menu.filter((m) => m.tags?.includes("special")).slice(0, 6);
export const thalis = () => itemsByCategory("thali");

export const searchMenu = (query: string) => {
  const qv = query.trim().toLowerCase();
  if (!qv) return [];
  return menu.filter(
    (m) =>
      m.name.toLowerCase().includes(qv) ||
      m.description.toLowerCase().includes(qv) ||
      m.ingredients.toLowerCase().includes(qv) ||
      m.categories.some((c) => c.includes(qv)),
  );
};

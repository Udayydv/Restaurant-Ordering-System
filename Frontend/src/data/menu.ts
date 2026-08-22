import shahiPaneer from "@/assets/dishes/shahi-paneer.jpg";
import mughlaiPaneer from "@/assets/dishes/mughlai-paneer.jpg";
import chilliPaneer from "@/assets/dishes/chilli-paneer.jpg";
import paneerButterMasala from "@/assets/dishes/paneer-butter-masala.jpg";
import kadaiPaneer from "@/assets/dishes/kadai-paneer.jpg";
import paneerKorma from "@/assets/dishes/paneer-korma.jpg";
import paneerKaliMirch from "@/assets/dishes/paneer-kali-mirch.jpg";
import paneerChangezi from "@/assets/dishes/paneer-changezi.jpg";
import paneerBhujia from "@/assets/dishes/paneer-bhujia.jpg";
import matarPaneer from "@/assets/dishes/matar-paneer.jpg";
import paneerDoPyaza from "@/assets/dishes/paneer-do-pyaza.jpg";
import malaiPaneer from "@/assets/dishes/malai-paneer.jpg";
import paneerPakoda from "@/assets/dishes/paneer-pakoda.jpg";
import paneerKurkure from "@/assets/dishes/paneer-kurkure.jpg";
import paneerManchurian from "@/assets/dishes/paneer-manchurian.jpg";
import paneerChowmein from "@/assets/dishes/paneer-chowmein.jpg";
import paneerPulao from "@/assets/dishes/paneer-pulao.jpg";
import dalFry from "@/assets/dishes/dal-fry.jpg";
import dalPunjabi from "@/assets/dishes/dal-punjabi.jpg";
import dalMakhani from "@/assets/dishes/dal-makhani.jpg";
import mixVeg from "@/assets/dishes/mix-veg.jpg";
import vegKadai from "@/assets/dishes/veg-kadai.jpg";
import vegKofta from "@/assets/dishes/veg-kofta.jpg";
import malaiKofta from "@/assets/dishes/malai-kofta.jpg";
import mushroomMasala from "@/assets/dishes/mushroom-masala.jpg";
import mushroomMatar from "@/assets/dishes/mushroom-matar.jpg";
import kadaiMushroom from "@/assets/dishes/kadai-mushroom.jpg";
import mushroomDoPyaza from "@/assets/dishes/mushroom-do-pyaza.jpg";
import sevBhaji from "@/assets/dishes/sev-bhaji.jpg";
import papadKorma from "@/assets/dishes/papad-korma.jpg";
import jeeraAloo from "@/assets/dishes/jeera-aloo.jpg";
import alooDoPyaza from "@/assets/dishes/aloo-do-pyaza.jpg";
import masalaAloo from "@/assets/dishes/masala-aloo.jpg";
import alooDum from "@/assets/dishes/aloo-dum.jpg";
import alooMatar from "@/assets/dishes/aloo-matar.jpg";
import rajmaChawal from "@/assets/dishes/rajma-chawal.jpg";
import choleChawal from "@/assets/dishes/chole-chawal.jpg";
import dalChawal from "@/assets/dishes/dal-chawal.jpg";
import vegChawal from "@/assets/dishes/veg-chawal.jpg";
import plainRice from "@/assets/dishes/plain-rice.jpg";
import jeeraRice from "@/assets/dishes/jeera-rice.jpg";
import vegPulao from "@/assets/dishes/veg-pulao.jpg";
import matarPulao from "@/assets/dishes/matar-pulao.jpg";
import friedRice from "@/assets/dishes/fried-rice.jpg";
import alooParatha from "@/assets/dishes/aloo-paratha.jpg";
import pyazParatha from "@/assets/dishes/pyaz-paratha.jpg";
import paneerParatha from "@/assets/dishes/paneer-paratha.jpg";
import plainParatha from "@/assets/dishes/plain-paratha.jpg";
import tawaRoti from "@/assets/dishes/tawa-roti.jpg";
import butterRoti from "@/assets/dishes/butter-roti.jpg";
import plainPuri from "@/assets/dishes/plain-puri.jpg";
import puriSabzi from "@/assets/dishes/puri-sabzi.jpg";
import sabziRoti from "@/assets/dishes/sabzi-roti.jpg";
import rajmaRoti from "@/assets/dishes/rajma-roti.jpg";
import choleBhature from "@/assets/dishes/chole-bhature.jpg";
import pyazPakoda from "@/assets/dishes/pyaz-pakoda.jpg";
import plainMaggi from "@/assets/dishes/plain-maggi.jpg";
import paneerMaggi from "@/assets/dishes/paneer-maggi.jpg";
import cheeseMaggi from "@/assets/dishes/cheese-maggi.jpg";
import masalaMaggi from "@/assets/dishes/masala-maggi.jpg";
import tea from "@/assets/dishes/tea.jpg";
import specialTea from "@/assets/dishes/special-tea.jpg";
import charitravanChai from "@/assets/dishes/charitravan-chai.jpg";
import coffee from "@/assets/dishes/coffee.jpg";
import chilliSoya from "@/assets/dishes/chilli-soya.jpg";
import chilliPotato from "@/assets/dishes/chilli-potato.jpg";
import vegChowmein from "@/assets/dishes/veg-chowmein.jpg";
import vegManchurian from "@/assets/dishes/veg-manchurian.jpg";
import masalaChaap from "@/assets/dishes/masala-chaap.jpg";
import boondiRaita from "@/assets/dishes/boondi-raita.jpg";
import vegRaita from "@/assets/dishes/veg-raita.jpg";
import kheeraRaita from "@/assets/dishes/kheera-raita.jpg";
import thaliGhar from "@/assets/dishes/thali-ghar.jpg";
import thaliSada from "@/assets/dishes/thali-sada.jpg";
import thaliSpecial from "@/assets/dishes/thali-special.jpg";
import thaliDeluxe from "@/assets/dishes/thali-deluxe.jpg";

export type Variant = {
  label: string;
  /** null = price not confirmed from the handwritten menu yet (editable). */
  price: number | null;
};

export type MenuItem = {
  id: string;
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
  { id: "paneer", label: "Paneer & Main Course", icon: "🍛" },
  { id: "thali", label: "Thalis", icon: "🍱" },
  { id: "rice", label: "Rice", icon: "🍚" },
  { id: "paratha", label: "Paratha", icon: "🫓" },
  { id: "roti", label: "Roti & Poori", icon: "🥖" },
  { id: "aloo", label: "Aloo Specials", icon: "🥔" },
  { id: "snacks", label: "Snacks", icon: "🍟" },
  { id: "chinese", label: "Chinese", icon: "🍜" },
  { id: "veg", label: "Veg Specials", icon: "🥗" },
  { id: "dal", label: "Dal", icon: "🍲" },
  { id: "maggi", label: "Maggi", icon: "🍝" },
  { id: "beverages", label: "Tea & Coffee", icon: "☕" },
  { id: "raita", label: "Raita", icon: "🥛" },
];

const PORTIONS: Record<number, string[]> = {
  1: ["Regular"],
  2: ["Half", "Full"],
  3: ["Half", "Full", "Family"],
  4: ["Quarter", "Half", "Full", "Family"],
};

/** Helper: build variants from a price list using standard portion names. */
const v = (...prices: (number | null)[]): Variant[] => {
  const labels = PORTIONS[prices.length] ?? prices.map((_, i) => `Size ${i + 1}`);
  return prices.map((price, i) => ({ label: labels[i] ?? `Size ${i + 1}`, price }));
};


export const menu: MenuItem[] = [
  // ---------------- PANEER / MAIN COURSE ----------------
  {
    id: "shahi-paneer",
    name: "Shahi Paneer",
    description: "Soft paneer in a rich, mildly sweet cashew-cream gravy.",
    ingredients: "Paneer, cashew, cream, onion, tomato, whole spices",
    image: shahiPaneer,
    categories: ["paneer"],
    variants: v(100, 140, 250),
    rating: 4.8,
    tags: ["bestseller", "special"],
  },
  {
    id: "mughlai-paneer",
    name: "Mughlai Paneer",
    description: "Royal Mughlai style paneer in a nutty, creamy yellow gravy.",
    ingredients: "Paneer, curd, cashew, almond, mild spices",
    image: mughlaiPaneer,
    categories: ["paneer"],
    variants: v(150, 260),
    rating: 4.6,
  },
  {
    id: "chilli-paneer",
    name: "Chilli Paneer",
    description: "Crisp paneer tossed with capsicum, onion and green chilli.",
    ingredients: "Paneer, capsicum, onion, green chilli, soy, garlic",
    image: chilliPaneer,
    categories: ["paneer", "chinese"],
    variants: v(170, 290),
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description: "Buttery tomato gravy with kasuri methi and fresh paneer.",
    ingredients: "Paneer, tomato, butter, cream, kasuri methi",
    image: paneerButterMasala,
    categories: ["paneer"],
    variants: v(110, 160, 270),
    rating: 4.9,
    tags: ["bestseller", "special"],
  },
  {
    id: "kadai-paneer",
    name: "Kadai Paneer",
    description: "Paneer cooked in freshly pounded kadai masala with capsicum.",
    ingredients: "Paneer, capsicum, onion, tomato, kadai masala",
    image: kadaiPaneer,
    categories: ["paneer"],
    variants: v(100, 150, 260),
    rating: 4.7,
    tags: ["special"],
  },
  {
    id: "paneer-korma",
    name: "Paneer Korma",
    description: "Slow-cooked korma gravy, delicate and lightly spiced.",
    ingredients: "Paneer, curd, cashew, korma masala",
    image: paneerKorma,
    categories: ["paneer"],
    variants: v(160, 270),
    rating: 4.5,
  },
  {
    id: "paneer-kali-mirch",
    name: "Paneer Kali Mirch",
    description: "White pepper-forward creamy gravy with soft paneer cubes.",
    ingredients: "Paneer, cream, black pepper, cashew",
    image: paneerKaliMirch,
    categories: ["paneer"],
    variants: v(140, 240),
    rating: 4.5,
  },
  {
    id: "paneer-changezi",
    name: "Paneer Changezi",
    description: "Bold, spicy Changezi masala with a swirl of cream.",
    ingredients: "Paneer, tomato, cream, fried onion, spices",
    image: paneerChangezi,
    categories: ["paneer"],
    variants: v(150, 260),
    rating: 4.6,
  },
  {
    id: "paneer-bhujia",
    name: "Paneer Bhujia",
    description: "Crumbled paneer bhurji with onion, tomato and coriander.",
    ingredients: "Paneer, onion, tomato, green chilli, coriander",
    image: paneerBhujia,
    categories: ["paneer"],
    variants: v(110, 160, 270),
    rating: 4.6,
  },
  {
    id: "matar-paneer",
    name: "Matar Paneer",
    description: "Everyday favourite — green peas and paneer in tomato gravy.",
    ingredients: "Paneer, green peas, tomato, onion",
    image: matarPaneer,
    categories: ["paneer"],
    variants: v(90, 130, 230),
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "paneer-do-pyaza",
    name: "Paneer Do Pyaza",
    description: "Paneer with double onion in a thick semi-dry masala.",
    ingredients: "Paneer, onion petals, tomato, spices",
    image: paneerDoPyaza,
    categories: ["paneer"],
    variants: v(100, 140, 260),
    rating: 4.5,
  },
  {
    id: "malai-paneer",
    name: "Malai Paneer",
    description: "Silky white malai gravy, rich and comforting.",
    ingredients: "Paneer, fresh cream, milk, cardamom",
    image: malaiPaneer,
    categories: ["paneer"],
    variants: v(180, 330),
    rating: 4.6,
  },
  {
    id: "paneer-pakoda",
    name: "Paneer Pakoda",
    description: "5 pieces of besan-coated paneer fritters with green chutney.",
    ingredients: "Paneer, gram flour, ajwain, spices",
    image: paneerPakoda,
    categories: ["paneer", "snacks"],
    variants: v(80, 140),
    rating: 4.7,
    tags: ["bestseller", "special"],
  },
  {
    id: "paneer-kurkure",
    name: "Paneer Kurkure",
    description: "5 pieces of crunchy crumb-coated paneer fingers.",
    ingredients: "Paneer, bread crumbs, corn flour, spices",
    image: paneerKurkure,
    categories: ["paneer", "snacks"],
    variants: v(90, 160),
    rating: 4.6,
  },
  {
    id: "paneer-manchurian",
    name: "Paneer Manchurian",
    description: "Fried paneer tossed in glossy Manchurian sauce.",
    ingredients: "Paneer, soy, chilli, garlic, spring onion",
    image: paneerManchurian,
    categories: ["paneer", "chinese"],
    variants: v(130, 210),
    rating: 4.6,
  },
  {
    id: "paneer-chowmein",
    name: "Paneer Chowmein",
    description: "Hakka noodles tossed with paneer and fresh vegetables.",
    ingredients: "Noodles, paneer, cabbage, carrot, capsicum",
    image: paneerChowmein,
    categories: ["paneer", "chinese"],
    variants: v(null),
    rating: 4.5,
  },
  {
    id: "paneer-pulao",
    name: "Paneer Pulao",
    description: "Fragrant rice cooked with paneer and whole spices.",
    ingredients: "Basmati rice, paneer, whole spices, ghee",
    image: paneerPulao,
    categories: ["paneer", "rice"],
    variants: v(null),
    rating: 4.5,
  },

  // ---------------- DAL ----------------
  {
    id: "dal-fry",
    name: "Dal Fry",
    description: "Yellow dal finished with a sizzling cumin-chilli tadka.",
    ingredients: "Arhar dal, cumin, garlic, tomato, ghee",
    image: dalFry,
    categories: ["dal"],
    variants: v(40, 80, 140),
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "dal-punjabi-tadka",
    name: "Dal Punjabi Tadka",
    description: "Thick Punjabi-style dal with a heavy ghee-garlic tadka.",
    ingredients: "Mixed dal, ghee, garlic, onion, tomato",
    image: dalPunjabi,
    categories: ["dal"],
    variants: v(90, 150),
    rating: 4.6,
  },
  {
    id: "dal-makhani",
    name: "Dal Makhani",
    description: "Slow-cooked black dal with butter and cream.",
    ingredients: "Urad dal, rajma, butter, cream, tomato",
    image: dalMakhani,
    categories: ["dal"],
    variants: v(null),
    rating: 4.8,
  },

  // ---------------- VEGETABLES ----------------
  {
    id: "mix-veg",
    name: "Mix Veg",
    description: "Seasonal vegetables cooked together in homely masala.",
    ingredients: "Potato, carrot, beans, peas, cauliflower, tomato",
    image: mixVeg,
    categories: ["veg"],
    variants: v(80, 140, 240),
    rating: 4.5,
  },
  {
    id: "veg-kadai",
    name: "Veg Kadai",
    description: "Mixed vegetables in a spicy freshly ground kadai masala.",
    ingredients: "Mixed vegetables, capsicum, tomato, kadai masala",
    image: vegKadai,
    categories: ["veg"],
    variants: v(150, 260),
    rating: 4.5,
  },
  {
    id: "veg-kofta",
    name: "Veg Kofta",
    description: "Vegetable dumplings simmered in onion-tomato gravy.",
    ingredients: "Mixed vegetables, gram flour, onion, tomato",
    image: vegKofta,
    categories: ["veg"],
    variants: v(110, 200),
    rating: 4.5,
  },
  {
    id: "malai-kofta",
    name: "Malai Kofta",
    description: "Soft paneer-potato koftas in a creamy white gravy.",
    ingredients: "Paneer, potato, cashew, cream",
    image: malaiKofta,
    categories: ["veg", "paneer"],
    variants: v(110, 190),
    rating: 4.7,
    tags: ["special"],
  },
  {
    id: "mushroom-masala",
    name: "Mushroom Masala",
    description: "Button mushrooms in a thick brown onion-tomato masala.",
    ingredients: "Mushroom, onion, tomato, spices",
    image: mushroomMasala,
    categories: ["veg"],
    variants: v(100, 150, 260),
    rating: 4.5,
  },
  {
    id: "mushroom-matar",
    name: "Mushroom Matar",
    description: "Mushroom and green peas in a light tomato gravy.",
    ingredients: "Mushroom, green peas, tomato, onion",
    image: mushroomMatar,
    categories: ["veg"],
    variants: v(70, 90, 140, 230),
    rating: 4.4,
  },
  {
    id: "kadai-mushroom",
    name: "Kadai Mushroom",
    description: "Mushrooms tossed with capsicum in kadai masala.",
    ingredients: "Mushroom, capsicum, onion, kadai masala",
    image: kadaiMushroom,
    categories: ["veg"],
    variants: v(70, 110, 140, 250),
    rating: 4.5,
  },
  {
    id: "mushroom-do-pyaza",
    name: "Mushroom Do Pyaza",
    description: "Mushrooms with generous onion petals, semi-dry.",
    ingredients: "Mushroom, onion, tomato, spices",
    image: mushroomDoPyaza,
    categories: ["veg"],
    variants: v(90, 130, 230),
    rating: 4.4,
  },
  {
    id: "sev-bhaji",
    name: "Sev Bhaji",
    description: "Spicy curry topped with crunchy besan sev.",
    ingredients: "Sev, tomato, onion, red chilli, spices",
    image: sevBhaji,
    categories: ["veg"],
    variants: v(130, 230),
    rating: 4.4,
  },
  {
    id: "papad-korma",
    name: "Papad Korma",
    description: "Roasted papad simmered in a creamy korma gravy.",
    ingredients: "Papad, curd, cashew, mild spices",
    image: papadKorma,
    categories: ["veg"],
    variants: v(120, 210),
    rating: 4.3,
  },

  // ---------------- ALOO SPECIALS ----------------
  {
    id: "jeera-aloo",
    name: "Jeera Aloo",
    description: "Potato cubes tempered with cumin and turmeric.",
    ingredients: "Potato, cumin, turmeric, coriander",
    image: jeeraAloo,
    categories: ["aloo"],
    variants: v(40, 70, 120),
    rating: 4.5,
  },
  {
    id: "aloo-do-pyaza",
    name: "Aloo Do Pyaza",
    description: "Potatoes cooked with plenty of onion, semi-dry.",
    ingredients: "Potato, onion, tomato, spices",
    image: alooDoPyaza,
    categories: ["aloo"],
    variants: v(90, 160),
    rating: 4.4,
  },
  {
    id: "masala-aloo",
    name: "Masala Aloo",
    description: "Spicy red masala coated potatoes, dhaba style.",
    ingredients: "Potato, red chilli, garlic, spices",
    image: masalaAloo,
    categories: ["aloo"],
    variants: v(70, 120),
    rating: 4.4,
  },
  {
    id: "aloo-dum",
    name: "Aloo Dum",
    description: "Baby potatoes slow-cooked in a rich spicy gravy.",
    ingredients: "Baby potato, tomato, onion, dum masala",
    image: alooDum,
    categories: ["aloo"],
    variants: v(110, 210),
    rating: 4.6,
  },
  {
    id: "aloo-matar",
    name: "Aloo Matar",
    description: "Potato and green peas in a light homely gravy.",
    ingredients: "Potato, green peas, tomato, onion",
    image: alooMatar,
    categories: ["aloo"],
    variants: v(40, 70, 120),
    rating: 4.5,
  },

  // ---------------- RAJMA / CHOLE / RICE ----------------
  {
    id: "rajma-chawal",
    name: "Rajma Chawal",
    description: "Homely rajma curry served with steamed rice.",
    ingredients: "Rajma, rice, onion, tomato, spices",
    image: rajmaChawal,
    categories: ["rice"],
    variants: v(70),
    rating: 4.8,
    tags: ["bestseller", "special"],
  },
  {
    id: "chole-chawal",
    name: "Chole Chawal",
    description: "Spiced chole with hot steamed rice — a full meal.",
    ingredients: "Chickpeas, rice, onion, tomato, chole masala",
    image: choleChawal,
    categories: ["rice"],
    variants: v(70),
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "dal-chawal",
    name: "Dal Chawal",
    description: "Simple, satisfying dal poured over steamed rice.",
    ingredients: "Dal, rice, ghee tadka",
    image: dalChawal,
    categories: ["rice"],
    variants: v(null),
    rating: 4.5,
  },
  {
    id: "veg-chawal",
    name: "Veg Chawal",
    description: "Mixed vegetable sabzi served with steamed rice.",
    ingredients: "Mixed vegetables, rice, spices",
    image: vegChawal,
    categories: ["rice"],
    variants: v(null),
    rating: 4.4,
  },
  {
    id: "plain-rice",
    name: "Plain Rice",
    description: "Steamed long-grain rice, freshly cooked.",
    ingredients: "Rice",
    image: plainRice,
    categories: ["rice"],
    variants: v(null),
    rating: 4.3,
  },
  {
    id: "jeera-rice",
    name: "Jeera Rice",
    description: "Basmati rice tempered with cumin and ghee.",
    ingredients: "Basmati rice, cumin, ghee",
    image: jeeraRice,
    categories: ["rice"],
    variants: v(35, 60, 110),
    rating: 4.6,
  },
  {
    id: "veg-pulao",
    name: "Veg Pulao",
    description: "Rice cooked with vegetables and whole spices.",
    ingredients: "Rice, carrot, peas, beans, whole spices",
    image: vegPulao,
    categories: ["rice"],
    variants: v(40, 70, 120),
    rating: 4.5,
  },
  {
    id: "matar-pulao",
    name: "Matar Pulao",
    description: "Green pea pulao, light and aromatic.",
    ingredients: "Rice, green peas, cumin, ghee",
    image: matarPulao,
    categories: ["rice"],
    variants: v(null),
    rating: 4.4,
  },
  {
    id: "fried-rice",
    name: "Fried Rice",
    description: "Indo-Chinese veg fried rice with crunchy vegetables.",
    ingredients: "Rice, carrot, beans, capsicum, spring onion",
    image: friedRice,
    categories: ["rice", "chinese"],
    variants: v(null),
    rating: 4.5,
  },

  // ---------------- PARATHA ----------------
  {
    id: "aloo-paratha",
    name: "Aloo Paratha",
    description: "Stuffed potato paratha served with curd and pickle.",
    ingredients: "Wheat flour, potato, spices, butter",
    image: alooParatha,
    categories: ["paratha"],
    variants: v(50),
    rating: 4.8,
    tags: ["bestseller", "special"],
  },
  {
    id: "pyaz-paratha",
    name: "Pyaz Paratha",
    description: "Onion-stuffed paratha, crisp outside and soft inside.",
    ingredients: "Wheat flour, onion, green chilli, spices",
    image: pyazParatha,
    categories: ["paratha"],
    variants: v(50),
    rating: 4.6,
  },
  {
    id: "paneer-paratha",
    name: "Paneer Paratha",
    description: "Generously stuffed with fresh crumbled paneer.",
    ingredients: "Wheat flour, paneer, spices, butter",
    image: paneerParatha,
    categories: ["paratha", "paneer"],
    variants: v(80),
    rating: 4.8,
    tags: ["bestseller"],
  },
  {
    id: "plain-paratha",
    name: "Plain Paratha",
    description: "Layered tawa paratha, hot off the griddle.",
    ingredients: "Wheat flour, oil",
    image: plainParatha,
    categories: ["paratha"],
    variants: v(25),
    rating: 4.4,
  },

  // ---------------- ROTI / POORI ----------------
  {
    id: "tawa-roti",
    name: "Tawa Roti",
    description: "Fresh wheat roti made on the tawa.",
    ingredients: "Wheat flour",
    image: tawaRoti,
    categories: ["roti"],
    variants: v(null),
    rating: 4.4,
  },
  {
    id: "butter-roti",
    name: "Butter Roti",
    description: "Tawa roti brushed with butter.",
    ingredients: "Wheat flour, butter",
    image: butterRoti,
    categories: ["roti"],
    variants: v(null),
    rating: 4.5,
  },
  {
    id: "plain-puri",
    name: "Plain Puri",
    description: "Golden puffed puri, freshly fried.",
    ingredients: "Wheat flour, oil",
    image: plainPuri,
    categories: ["roti"],
    variants: v(20),
    rating: 4.5,
  },
  {
    id: "puri-sabzi",
    name: "Puri Sabzi",
    description: "Hot puris served with aloo sabzi.",
    ingredients: "Puri, potato sabzi, spices",
    image: puriSabzi,
    categories: ["roti", "snacks"],
    variants: v(60),
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "sabzi-4-roti",
    name: "Sabzi + 4 Roti",
    description: "Complete meal — seasonal sabzi with 4 fresh rotis.",
    ingredients: "Seasonal sabzi, 4 tawa rotis, salad",
    image: sabziRoti,
    categories: ["roti", "thali"],
    variants: v(70),
    rating: 4.7,
    tags: ["special"],
  },
  {
    id: "rajma-4-roti",
    name: "Rajma + 4 Roti",
    description: "Rajma curry with 4 fresh tawa rotis.",
    ingredients: "Rajma, 4 tawa rotis, onion salad",
    image: rajmaRoti,
    categories: ["roti", "thali"],
    variants: v(70),
    rating: 4.7,
  },

  // ---------------- SNACKS ----------------
  {
    id: "chole-bhature",
    name: "Chole Bhature",
    description: "Two fluffy bhature with spicy chole, onion and pickle.",
    ingredients: "Maida, chickpeas, onion, chole masala",
    image: choleBhature,
    categories: ["snacks"],
    variants: v(70),
    rating: 4.9,
    tags: ["bestseller", "special"],
  },
  {
    id: "pyaz-pakoda",
    name: "Pyaz Pakoda",
    description: "10 pieces of crisp onion pakode with green chutney.",
    ingredients: "Onion, gram flour, ajwain, spices",
    image: pyazPakoda,
    categories: ["snacks"],
    variants: v(60),
    rating: 4.6,
  },

  // ---------------- MAGGI ----------------
  {
    id: "plain-maggi",
    name: "Plain Maggi",
    description: "Classic hot noodles, simple and comforting.",
    ingredients: "Noodles, maggi masala",
    image: plainMaggi,
    categories: ["maggi", "snacks"],
    variants: v(60, 100),
    rating: 4.5,
  },
  {
    id: "paneer-maggi-masala",
    name: "Paneer Maggi Masala",
    description: "Masala maggi loaded with fresh paneer cubes.",
    ingredients: "Noodles, paneer, onion, tomato, masala",
    image: paneerMaggi,
    categories: ["maggi", "snacks", "paneer"],
    variants: v(70, 130),
    rating: 4.6,
  },
  {
    id: "cheese-maggi-masala",
    name: "Cheese Maggi Masala",
    description: "Masala maggi with a generous melt of cheese.",
    ingredients: "Noodles, cheese, onion, tomato, masala",
    image: cheeseMaggi,
    categories: ["maggi", "snacks"],
    variants: v(90, 150),
    rating: 4.6,
  },
  {
    id: "maggi-masala",
    name: "Maggi Masala",
    description: "Desi masala maggi with onion, tomato and coriander.",
    ingredients: "Noodles, onion, tomato, green chilli, masala",
    image: masalaMaggi,
    categories: ["maggi", "snacks"],
    variants: v(70, 120),
    rating: 4.5,
  },

  // ---------------- TEA / COFFEE ----------------
  {
    id: "tea",
    name: "Tea",
    description: "Freshly brewed Indian chai.",
    ingredients: "Tea leaves, milk, sugar, ginger",
    image: tea,
    categories: ["beverages"],
    variants: v(20),
    rating: 4.7,
  },
  {
    id: "special-tea",
    name: "Special Tea",
    description: "Extra malai, extra elaichi — our special chai.",
    ingredients: "Tea leaves, full cream milk, cardamom, sugar",
    image: specialTea,
    categories: ["beverages"],
    variants: v(30),
    rating: 4.8,
    tags: ["bestseller"],
  },
  {
    id: "charitravan-chai",
    name: "Charitravan Chai",
    description: "House herbal chai with tulsi, ginger and spices.",
    ingredients: "Tea, tulsi, ginger, herbal spices",
    image: charitravanChai,
    categories: ["beverages"],
    variants: v(25),
    rating: 4.6,
  },
  {
    id: "coffee",
    name: "Coffee",
    description: "Hot frothy coffee, freshly made.",
    ingredients: "Coffee, milk, sugar",
    image: coffee,
    categories: ["beverages"],
    variants: v(45),
    rating: 4.5,
  },

  // ---------------- CHINESE ----------------
  {
    id: "chilli-soya-chunk",
    name: "Chilli Soya Chunk",
    description: "Soya chunks tossed in spicy Indo-Chinese sauce.",
    ingredients: "Soya chunks, capsicum, onion, chilli sauce",
    image: chilliSoya,
    categories: ["chinese"],
    variants: v(null),
    rating: 4.4,
  },
  {
    id: "chilli-potato",
    name: "Chilli Potato",
    description: "Crispy potato fingers in sweet-spicy chilli sauce.",
    ingredients: "Potato, chilli sauce, capsicum, sesame",
    image: chilliPotato,
    categories: ["chinese", "snacks"],
    variants: v(80),
    rating: 4.7,
    tags: ["bestseller"],
  },
  {
    id: "veg-chowmein",
    name: "Veg Chowmein",
    description: "Street-style hakka noodles with crunchy vegetables.",
    ingredients: "Noodles, cabbage, carrot, capsicum, sauces",
    image: vegChowmein,
    categories: ["chinese"],
    variants: v(50),
    rating: 4.7,
    tags: ["bestseller", "special"],
  },
  {
    id: "veg-manchurian",
    name: "Veg Manchurian",
    description: "Vegetable balls in glossy Manchurian gravy.",
    ingredients: "Mixed vegetables, corn flour, soy, garlic",
    image: vegManchurian,
    categories: ["chinese"],
    variants: v(null),
    rating: 4.5,
  },
  {
    id: "masala-chaap",
    name: "Masala Chaap",
    description: "Soya chaap coated in tandoori-style masala.",
    ingredients: "Soya chaap, curd, red masala, lemon",
    image: masalaChaap,
    categories: ["chinese", "snacks"],
    variants: v(null),
    rating: 4.5,
  },

  // ---------------- RAITA ----------------
  {
    id: "boondi-raita",
    name: "Boondi Raita",
    description: "Chilled curd with soft boondi and roasted spices.",
    ingredients: "Curd, boondi, jeera powder, chilli",
    image: boondiRaita,
    categories: ["raita"],
    variants: v(35, 60, 110),
    rating: 4.6,
  },
  {
    id: "veg-raita",
    name: "Veg Raita",
    description: "Curd with fresh onion, tomato and cucumber.",
    ingredients: "Curd, onion, tomato, cucumber, coriander",
    image: vegRaita,
    categories: ["raita"],
    variants: v(60, 110),
    rating: 4.5,
  },
  {
    id: "kheera-raita",
    name: "Kheera Raita",
    description: "Cooling cucumber raita with roasted cumin.",
    ingredients: "Curd, cucumber, roasted cumin, salt",
    image: kheeraRaita,
    categories: ["raita"],
    variants: v(90, 150),
    rating: 4.5,
  },

  // ---------------- THALIS ----------------
  {
    id: "ghar-ki-thali",
    name: "Ghar Ki Thali",
    description: "Everyday homely thali — dal, sabzi, rice, roti, salad.",
    ingredients: "Dal, seasonal sabzi, rice, roti, salad, pickle",
    image: thaliGhar,
    categories: ["thali"],
    variants: v(70),
    rating: 4.8,
    tags: ["bestseller", "special"],
  },
  {
    id: "sada-bhojan-thali",
    name: "Sada Bhojan Thali",
    description: "Simple satvik meal — dal, rice, roti, salad and pickle.",
    ingredients: "Dal, rice, roti, salad, pickle",
    image: thaliSada,
    categories: ["thali"],
    variants: v(null),
    rating: 4.6,
  },
  {
    id: "special-thali",
    name: "Special Thali",
    description: "Dal, paneer, raita and 4 roti/puri as applicable.",
    ingredients: "Dal, paneer sabzi, raita, 4 roti or puri, salad",
    image: thaliSpecial,
    categories: ["thali"],
    variants: v(140),
    rating: 4.9,
    tags: ["bestseller", "special"],
  },
  {
    id: "super-deluxe-thali",
    name: "Super Deluxe Thali",
    description: "Our biggest thali — a full festive vegetarian spread.",
    ingredients: "Paneer, dal, kofta, raita, pulao, roti/puri, salad, sweet",
    image: thaliDeluxe,
    categories: ["thali"],
    variants: v(180),
    rating: 4.9,
    tags: ["special"],
  },
];

/** EDITABLE: what goes inside each thali package. */
export const thaliContents: Record<string, string[]> = {
  "ghar-ki-thali": ["Dal", "Seasonal Sabzi", "Rice", "Roti", "Salad & Pickle"],
  "sada-bhojan-thali": ["Dal", "Rice", "Roti", "Salad", "Pickle"],
  "special-thali": ["Dal", "Paneer", "Raita", "4 Roti / Puri (as applicable)"],
  "super-deluxe-thali": [
    "Paneer Sabzi",
    "Dal",
    "Kofta",
    "Raita",
    "Pulao",
    "4 Roti / Puri",
    "Salad, Papad & Sweet",
  ],
};

export const menuById = (id: string) => menu.find((m) => m.id === id);

export const itemsByCategory = (categoryId: string) =>
  menu.filter((m) => m.categories.includes(categoryId));

export const startingPrice = (item: MenuItem) => {
  const prices = item.variants.map((x) => x.price).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
};

export const bestSellers = () => menu.filter((m) => m.tags?.includes("bestseller"));
export const todaysSpecial = () => menu.filter((m) => m.tags?.includes("special")).slice(0, 6);
export const thalis = () => itemsByCategory("thali").filter((t) => t.id.includes("thali"));

export const searchMenu = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return menu.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.ingredients.toLowerCase().includes(q) ||
      m.categories.some((c) => c.includes(q)),
  );
};

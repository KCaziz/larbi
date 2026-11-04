import {
  Ambulance, ArrowLeftRight, Ban, Baby, Banknote, BedDouble, Bike, Bone, BookOpen, BrickWall, Briefcase, BriefcaseBusiness, Brush, Building, Building2, Bus, Cake, CalendarDays, Car,
  CarTaxiFront, ChartLine, CircleDot, CircleParking, Clapperboard, Cloud, Coffee, Coins, CreditCard, Croissant, Dices, Disc3, Dog, Drama, Droplet, Dumbbell, FileText, FireExtinguisher,
  Flame, FlaskConical, Flower2, FolderOpen, Footprints, Fuel, Gamepad2, Gift, Glasses, Globe, GraduationCap, HandHeart, Handshake, Heart, Hospital, House, Landmark, Laptop, Library,
  LifeBuoy, Lightbulb, Lock, Mail, Map, Monitor, Music, NotebookPen, Package, Palette, PartyPopper, PawPrint, Pencil, Pill, Plane, PiggyBank, Plug, Plus, Presentation, Receipt,
  Repeat, School, ScrollText, Scissors, ShieldCheck, Shirt, ShoppingBag, ShoppingCart, Smartphone, Smile, Sofa, Salad, Sparkles, Star, Stethoscope, Sunrise, Tag, Target, Timer,
  Gem, Rocket, Sprout, Ticket, Toolbox, Trophy, TrendingDown, TrendingUp, TriangleAlert, Undo2, Users, Utensils, UtensilsCrossed, WashingMachine, Wrench,
} from 'lucide-react';

// The categories, the accounts and the common categories come with an emoji
// from the server's reference (it is the key of the icon, nothing more). The
// screens draw a real icon of the application's own set instead — the same
// stroke and the same size everywhere, whatever the system's emoji font
// (SUIVI_RECETTE R3-06). An emoji with no icon here draws a neutral tag, never
// the emoji.
const ICONS = {
  '💼': Briefcase, '⭐': Star, '⏱': Timer, '🎯': Target, '🧾': Receipt, '🎓': GraduationCap, '👪': Users, '🧑‍💼': BriefcaseBusiness, '🧑‍🎓': School, '🧑‍💻': Laptop,
  '🛠': Wrench, '🛍': ShoppingBag, '🏠': House, '📈': TrendingUp, '💹': ChartLine, '📜': ScrollText, '🌅': Sunrise, '🏛': Landmark, '🎁': Gift, '📦': Package,
  '↩': Undo2, '🛡': ShieldCheck, '🏷': Tag, '➕': Plus, '🏦': Building2, '🏢': Building, '💡': Lightbulb, '🔥': Flame, '💧': Droplet, '🧰': Toolbox,
  '🔧': Wrench, '🛋': Sofa, '🔐': Lock, '🛒': ShoppingCart, '🥖': Croissant, '🍽': Utensils, '☕': Coffee, '🛵': Bike, '🥗': Salad, '🚌': Bus,
  '⛽': Fuel, '🚕': CarTaxiFront, '🅿': CircleParking, '🛞': Disc3, '🚙': Car, '📱': Smartphone, '🌐': Globe, '🎬': Clapperboard, '🎵': Music, '☁': Cloud,
  '💻': Laptop, '🎮': Gamepad2, '🖥': Monitor, '🩺': Stethoscope, '💊': Pill, '🧪': FlaskConical, '🦷': Smile, '👓': Glasses, '🏥': Hospital, '🧴': Sparkles,
  '🏋': Dumbbell, '🧘': Flower2, '📚': Library, '✏': Pencil, '🧑‍🏫': Presentation, '📘': BookOpen, '📝': NotebookPen, '🧸': Baby, '🏫': School, '👕': Shirt,
  '⚽': Trophy, '🪙': Coins, '🤝': Handshake, '👟': Footprints, '💇': Scissors, '🧹': Brush, '🔌': Plug, '🧺': WashingMachine, '🧱': BrickWall, '🎉': PartyPopper,
  '🎭': Drama, '📖': BookOpen, '🎨': Palette, '🎲': Dices, '✈': Plane, '🏨': BedDouble, '🍴': UtensilsCrossed, '🗺': Map, '💳': CreditCard, '↔': ArrowLeftRight,
  '📉': TrendingDown, '⚠': TriangleAlert, '🚗': Car, '📅': CalendarDays, '📄': FileText, '🚫': Ban, '❤': Heart, '🤲': HandHeart, '🐾': PawPrint, '🐕': Dog,
  '🦴': Bone, '🚑': Ambulance, '🧯': FireExtinguisher, '🆘': LifeBuoy, '🔁': Repeat, '🎂': Cake, '💵': Banknote, '📮': Mail, '🐷': PiggyBank, '🗂': FolderOpen,
  '🌱': Sprout, '👶': Baby, '🧒': Baby, '🚀': Rocket, '💍': Gem, '🎟': Ticket, '🚘': Car, '🛟': LifeBuoy,
  '🔄': Repeat, '🏧': Banknote, '🚨': TriangleAlert, '💰': Coins, '🪪': CreditCard,
};

// Without the variation selector some emoji carry (U+FE0F), so '⏱️' and '⏱' are one key.
const keyOf = (emoji) => String(emoji ?? '').replace(/️/g, '').trim();

/** The text of an emoji-prefixed label, without the emoji (for a `<option>`, which holds only text). */
export const withoutEmoji = (text) => String(text ?? '').replace(/^[^\p{L}\p{N}(«"']+/u, '').trim();

export default function CategoryIcon({ emoji, size = 16, className = 'category-icon' }) {
  const Icon = ICONS[keyOf(emoji)] ?? Tag;
  return <Icon className={className} size={size} strokeWidth={1.75} aria-hidden="true" />;
}

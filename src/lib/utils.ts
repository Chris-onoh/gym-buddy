import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  let result = "";
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      result += (result ? " " : "") + input;
    } else if (Array.isArray(input)) {
      const joined = cn(...input);
      if (joined) result += (result ? " " : "") + joined;
    }
  }
  return result;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
] as const;

export const CLASS_TYPE_COLORS: Record<string, string> = {
  YOGA: "bg-purple-100 text-purple-800 border-purple-200",
  HIIT: "bg-red-100 text-red-800 border-red-200",
  STRENGTH: "bg-blue-100 text-blue-800 border-blue-200",
  CARDIO: "bg-orange-100 text-orange-800 border-orange-200",
  PILATES: "bg-pink-100 text-pink-800 border-pink-200",
  SPINNING: "bg-cyan-100 text-cyan-800 border-cyan-200",
  ZUMBA: "bg-yellow-100 text-yellow-800 border-yellow-200",
  BOXING: "bg-gray-100 text-gray-800 border-gray-200",
  CROSSFIT: "bg-green-100 text-green-800 border-green-200",
  MEDITATION: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export const CLASS_TYPE_ICONS: Record<string, string> = {
  YOGA: "🧘",
  HIIT: "⚡",
  STRENGTH: "💪",
  CARDIO: "🏃",
  PILATES: "🤸",
  SPINNING: "🚴",
  ZUMBA: "💃",
  BOXING: "🥊",
  CROSSFIT: "🏋️",
  MEDITATION: "🧠",
};

export const MEMBERSHIP_PLANS = [
  {
    plan: "BASIC",
    name: "Basic",
    features: [
      "Access to gym floor",
      "5 group classes/month",
      "Locker room access",
    ],
    color: "from-gray-500 to-gray-700",
  },
  {
    plan: "PREMIUM",
    name: "Premium",
    features: [
      "Unlimited gym access",
      "Unlimited group classes",
      "Locker room + sauna",
      "1 PT session/month",
      "Progress tracking",
    ],
    color: "from-primary-500 to-primary-700",
    popular: true,
  },
  {
    plan: "ELITE",
    name: "Elite",
    features: [
      "All Premium features",
      "4 PT sessions/month",
      "Nutrition planning",
      "Priority class booking",
      "Guest passes (2/month)",
      "Exclusive events",
    ],
    color: "from-accent-500 to-accent-700",
  },
];

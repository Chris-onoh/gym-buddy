"use client";

// GymBuddy local data store
// All data lives in localStorage - no database needed.
// Perfect for demos: every visitor gets fresh seeded data,
// their interactions persist across page refreshes.

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  goals?: string;
  role?: "member" | "admin";
  createdAt: string;
}

export interface GymClass {
  id: string;
  name: string;
  description: string;
  type: string;
  instructor: string;
  instructorBio?: string;
  duration: number;
  capacity: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  _count?: { bookings: number; waitlists: number };
}

export interface Booking {
  id: string;
  userId: string;
  classId: string;
  date: string;
  status: "CONFIRMED" | "CANCELLED";
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  classId: string;
  date: string;
  position: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  description?: string;
  order: number;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
  _count?: { exercises: number };
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId: string;
  workout?: Workout;
  date: string;
  duration: number;
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}

export interface Membership {
  userId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  type: string;
  description: string;
  createdAt: string;
}

interface DB {
  users: User[];
  classes: GymClass[];
  bookings: Booking[];
  waitlists: WaitlistEntry[];
  workouts: Workout[];
  workoutLogs: WorkoutLog[];
  progress: ProgressEntry[];
  memberships: Membership[];
  payments: Payment[];
}

const DB_KEY = "gymbuddy_db_v1";
const SESSION_KEY = "gymbuddy_session_v1";

// ---------- Helpers ----------

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function todayStr(): string {
  return new Date().toISOString();
}

// ---------- Seed data ----------

const SEED_CLASSES: Omit<GymClass, "id">[] = [
  { name: "Morning Yoga Flow", description: "Start your day with gentle yoga flows to improve flexibility and mindfulness. Suitable for all levels.", type: "YOGA", instructor: "Sarah Johnson", instructorBio: "Certified yoga instructor with 10 years of experience in Hatha and Vinyasa yoga.", duration: 60, capacity: 25, dayOfWeek: 1, startTime: "07:00", endTime: "08:00", room: "Studio A" },
  { name: "HIIT Blast", description: "High-intensity interval training to burn maximum calories in minimum time. Get ready to sweat!", type: "HIIT", instructor: "Mike Torres", instructorBio: "Former competitive athlete turned fitness coach. Specializes in HIIT and functional training.", duration: 45, capacity: 20, dayOfWeek: 1, startTime: "12:00", endTime: "12:45", room: "Main Floor" },
  { name: "Strength & Conditioning", description: "Build muscle and improve overall strength with compound movements and conditioning work.", type: "STRENGTH", instructor: "Alex Kim", instructorBio: "Powerlifting coach and certified strength specialist. Helps members achieve their strength goals.", duration: 60, capacity: 15, dayOfWeek: 2, startTime: "09:00", endTime: "10:00", room: "Weight Room" },
  { name: "Cardio Kickboxing", description: "Punch and kick your way to fitness! A high-energy cardio workout that builds endurance.", type: "CARDIO", instructor: "Lisa Chen", instructorBio: "Martial arts expert with a passion for making fitness fun and accessible.", duration: 50, capacity: 30, dayOfWeek: 2, startTime: "17:30", endTime: "18:20", room: "Studio B" },
  { name: "Pilates Core", description: "Strengthen your core, improve posture, and increase body awareness with Pilates.", type: "PILATES", instructor: "Emma Wright", instructorBio: "Pilates instructor focusing on alignment and mindful movement for all fitness levels.", duration: 55, capacity: 20, dayOfWeek: 3, startTime: "08:00", endTime: "08:55", room: "Studio A" },
  { name: "Spin Revolution", description: "Indoor cycling with pumped-up music and an energetic atmosphere. Climb, sprint, and ride!", type: "SPINNING", instructor: "Chris Davis", instructorBio: "Enthusiastic cycling coach who brings the energy to every class.", duration: 45, capacity: 25, dayOfWeek: 3, startTime: "18:00", endTime: "18:45", room: "Spin Room" },
  { name: "Zumba Party", description: "Dance your way to fitness with Latin-inspired moves. No dance experience needed!", type: "ZUMBA", instructor: "Maria Santos", instructorBio: "Licensed Zumba instructor who brings the Latin rhythm to every session.", duration: 60, capacity: 35, dayOfWeek: 4, startTime: "10:00", endTime: "11:00", room: "Studio B" },
  { name: "Boxing Fundamentals", description: "Learn proper boxing technique while getting an incredible full-body workout.", type: "BOXING", instructor: "James Wilson", instructorBio: "Former amateur boxer teaching proper form and conditioning.", duration: 60, capacity: 15, dayOfWeek: 4, startTime: "16:00", endTime: "17:00", room: "Boxing Ring" },
  { name: "CrossFit WOD", description: "Workout of the Day - varied functional movements performed at high intensity.", type: "CROSSFIT", instructor: "Ryan Park", instructorBio: "Level 2 CrossFit coach helping members push their limits safely.", duration: 60, capacity: 20, dayOfWeek: 5, startTime: "06:30", endTime: "07:30", room: "CrossFit Zone" },
  { name: "Mindful Meditation", description: "End your week with calming meditation to reduce stress and improve mental clarity.", type: "MEDITATION", instructor: "Sarah Johnson", instructorBio: "Certified meditation and mindfulness teacher.", duration: 45, capacity: 30, dayOfWeek: 5, startTime: "19:00", endTime: "19:45", room: "Studio A" },
  { name: "Weekend Warrior HIIT", description: "Saturday morning HIIT to kickstart your weekend with energy and endorphins.", type: "HIIT", instructor: "Mike Torres", duration: 45, capacity: 25, dayOfWeek: 6, startTime: "09:00", endTime: "09:45", room: "Main Floor" },
  { name: "Sunday Stretch & Recovery", description: "Active recovery session focusing on stretching, foam rolling, and mobility work.", type: "YOGA", instructor: "Emma Wright", duration: 60, capacity: 25, dayOfWeek: 0, startTime: "10:00", endTime: "11:00", room: "Studio A" },
];

const SEED_WORKOUTS: (Omit<Workout, "id" | "exercises"> & { exercises: Omit<Exercise, "id">[] })[] = [
  {
    title: "Full Body Beginner", type: "FULL_BODY", difficulty: "BEGINNER", duration: 30,
    description: "Perfect for newcomers. Covers all major muscle groups with bodyweight exercises.",
    exercises: [
      { name: "Bodyweight Squats", sets: 3, reps: 12, restTime: 60, order: 0, description: "Keep your chest up and back straight" },
      { name: "Push-ups (Knee)", sets: 3, reps: 10, restTime: 60, order: 1, description: "Start on knees if needed" },
      { name: "Glute Bridges", sets: 3, reps: 15, restTime: 45, order: 2, description: "Squeeze glutes at the top" },
      { name: "Plank Hold", duration: 30, sets: 3, restTime: 45, order: 3, description: "Keep core tight, back straight" },
      { name: "Jumping Jacks", duration: 45, sets: 3, restTime: 30, order: 4, description: "Light cardio to finish" },
    ],
  },
  {
    title: "Upper Body Strength", type: "UPPER_BODY", difficulty: "INTERMEDIATE", duration: 45,
    description: "Build your chest, back, shoulders, and arms with this comprehensive upper body routine.",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, restTime: 90, order: 0, description: "Keep shoulder blades retracted" },
      { name: "Bent Over Rows", sets: 4, reps: 10, restTime: 90, order: 1, description: "Pull to lower chest, squeeze back" },
      { name: "Overhead Press", sets: 3, reps: 10, restTime: 75, order: 2, description: "Press directly overhead, core tight" },
      { name: "Lateral Raises", sets: 3, reps: 15, restTime: 60, order: 3, description: "Light weight, focus on form" },
      { name: "Bicep Curls", sets: 3, reps: 12, restTime: 60, order: 4, description: "No swinging, controlled movement" },
      { name: "Tricep Dips", sets: 3, reps: 12, restTime: 60, order: 5, description: "Keep elbows close to body" },
    ],
  },
  {
    title: "HIIT Cardio Blast", type: "HIIT", difficulty: "ADVANCED", duration: 25,
    description: "Maximum intensity interval training. 40 seconds work, 20 seconds rest. Get ready to sweat!",
    exercises: [
      { name: "Burpees", duration: 40, restTime: 20, order: 0 },
      { name: "Mountain Climbers", duration: 40, restTime: 20, order: 1 },
      { name: "Box Jumps", duration: 40, restTime: 20, order: 2 },
      { name: "Kettlebell Swings", duration: 40, restTime: 20, order: 3 },
      { name: "Battle Ropes", duration: 40, restTime: 20, order: 4 },
      { name: "Sprint Intervals", duration: 40, restTime: 20, order: 5 },
    ],
  },
  {
    title: "Core Crusher", type: "CORE", difficulty: "INTERMEDIATE", duration: 20,
    description: "Target your entire core - abs, obliques, and lower back.",
    exercises: [
      { name: "Crunch", sets: 3, reps: 20, restTime: 30, order: 0 },
      { name: "Russian Twists", sets: 3, reps: 20, restTime: 30, order: 1, description: "Each side counts as one" },
      { name: "Leg Raises", sets: 3, reps: 15, restTime: 45, order: 2, description: "Don't let feet touch the ground" },
      { name: "Bicycle Crunches", sets: 3, reps: 20, restTime: 30, order: 3 },
      { name: "Superman Hold", duration: 30, sets: 3, restTime: 30, order: 4 },
      { name: "Side Plank", duration: 30, sets: 2, restTime: 30, order: 5, description: "30 seconds each side" },
    ],
  },
  {
    title: "Lower Body Power", type: "LOWER_BODY", difficulty: "ADVANCED", duration: 50,
    description: "Build strong legs and glutes with this intense lower body session.",
    exercises: [
      { name: "Barbell Squats", sets: 4, reps: 8, restTime: 120, order: 0, description: "Go deep, drive through heels" },
      { name: "Romanian Deadlifts", sets: 4, reps: 10, restTime: 90, order: 1, description: "Hinge at hips, slight knee bend" },
      { name: "Walking Lunges", sets: 3, reps: 12, restTime: 75, order: 2, description: "12 per leg, keep torso upright" },
      { name: "Leg Press", sets: 3, reps: 12, restTime: 75, order: 3 },
      { name: "Calf Raises", sets: 4, reps: 20, restTime: 45, order: 4 },
      { name: "Hamstring Curls", sets: 3, reps: 15, restTime: 60, order: 5 },
    ],
  },
  {
    title: "Flexibility & Mobility", type: "FLEXIBILITY", difficulty: "BEGINNER", duration: 25,
    description: "Improve range of motion and reduce injury risk with this mobility routine.",
    exercises: [
      { name: "Cat-Cow Stretch", duration: 60, order: 0, description: "Slow and controlled movement" },
      { name: "World's Greatest Stretch", duration: 60, order: 1, description: "30 seconds per side" },
      { name: "Hip Flexor Stretch", duration: 60, order: 2, description: "Hold deep stretch, each side" },
      { name: "Shoulder Dislocates", reps: 10, order: 3, description: "Use a band or towel" },
      { name: "Pigeon Pose", duration: 60, order: 4, description: "30 seconds each side" },
      { name: "Downward Dog to Cobra", duration: 60, order: 5, description: "Flow between the two" },
    ],
  },
];

// ---------- DB access ----------

let cache: DB | null = null;

function seedDB(): DB {
  const db: DB = {
    users: [],
    classes: [],
    bookings: [],
    waitlists: [],
    workouts: [],
    workoutLogs: [],
    progress: [],
    memberships: [],
    payments: [],
  };

  db.classes = SEED_CLASSES.map((c) => ({ ...c, id: uid() }));
  db.workouts = SEED_WORKOUTS.map((w) => ({
    ...w,
    id: uid(),
    exercises: w.exercises.map((e) => ({ ...e, id: uid() })),
  }));

  return db;
}

export async function getDB(): Promise<DB> {
  if (cache) return cache;
  if (typeof window === "undefined") return seedDB();

  const raw = window.localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as DB;
      return cache;
    } catch {
      // fall through to reseed
    }
  }

  const db = seedDB();
  // Seed admin user
  const adminHash = await sha256("admin");
  const admin: User = {
    id: "u_admin",
    name: "Admin",
    email: "admin@gymbuddy.com",
    passwordHash: adminHash,
    role: "admin",
    createdAt: todayStr(),
  };
  db.users.push(admin);

  // Seed demo user (async hash)
  const hash = await sha256("password123");
  const demo: User = {
    id: "u_demo",
    name: "Alex Demo",
    email: "demo@example.com",
    passwordHash: hash,
    phone: "+2348000000000",
    weight: 75,
    height: 175,
    bodyFat: 18,
    goals: "Build muscle and stay consistent",
    role: "member",
    createdAt: todayStr(),
  };
  db.users.push(demo);

  // Demo membership (PREMIUM, 1 year)
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  db.memberships.push({
    userId: demo.id,
    plan: "PREMIUM",
    status: "ACTIVE",
    startDate: todayStr(),
    endDate: end.toISOString(),
    autoRenew: true,
  });

  // 5 weeks of progress entries for the demo chart
  for (let i = 28; i >= 0; i -= 7) {
    db.progress.push({
      id: uid(),
      userId: demo.id,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      weight: 78 - i * 0.1,
      bodyFat: 20 - i * 0.07,
      muscleMass: 34 + i * 0.05,
    });
  }

  // A couple of bookings for the demo dashboard
  const yoga = db.classes[0];
  const spin = db.classes[5];
  const nextDate = (dow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7));
    return d.toISOString();
  };
  db.bookings.push(
    { id: uid(), userId: demo.id, classId: yoga.id, date: nextDate(yoga.dayOfWeek), status: "CONFIRMED" },
    { id: uid(), userId: demo.id, classId: spin.id, date: nextDate(spin.dayOfWeek), status: "CONFIRMED" }
  );

  // Some workout logs
  db.workoutLogs.push(
    { id: uid(), userId: demo.id, workoutId: db.workouts[0].id, date: new Date(Date.now() - 2 * 86400000).toISOString(), duration: 30 },
    { id: uid(), userId: demo.id, workoutId: db.workouts[1].id, date: new Date(Date.now() - 5 * 86400000).toISOString(), duration: 45 },
    { id: uid(), userId: demo.id, workoutId: db.workouts[3].id, date: new Date(Date.now() - 9 * 86400000).toISOString(), duration: 20 }
  );

  // Payment history
  const mkPayment = (amount: number, type: string, desc: string, daysAgo: number, status = "COMPLETED"): Payment => ({
    id: uid(),
    userId: demo.id,
    amount,
    currency: "NGN",
    status,
    reference: "GB-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    type,
    description: desc,
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  });
  db.payments.push(
    mkPayment(35000, "MEMBERSHIP", "Premium membership - monthly", 30),
    mkPayment(15000, "PT_SESSION", "Personal training session x2", 12),
    mkPayment(5000, "CLASS_PACK", "Class pack top-up", 3)
  );

  saveDB(db);
  return db;
}

export function saveDB(db: DB) {
  cache = db;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
}

export function resetDB() {
  cache = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DB_KEY);
  }
}

// ---------- Auth ----------

export async function registerUser(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ ok: boolean; error?: string; user?: User }> {
  const db = await getDB();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "Email already registered" };
  }
  const user: User = {
    id: uid(),
    name,
    email,
    passwordHash: await sha256(password),
    phone,
    createdAt: todayStr(),
  };
  db.users.push(user);
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  db.memberships.push({
    userId: user.id,
    plan: "BASIC",
    status: "ACTIVE",
    startDate: todayStr(),
    endDate: end.toISOString(),
    autoRenew: false,
  });
  saveDB(db);
  return { ok: true, user };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: User }> {
  const db = await getDB();
  // Support "admin" as shortcut for admin@gymbuddy.com
  let cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === "admin") cleanEmail = "admin@gymbuddy.com";
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) return { ok: false, error: "Invalid email or password" };
  // Admin shortcut: accept "admin" as password
  if (user.role === "admin" && (password === "admin")) {
    return { ok: true, user };
  }
  const hash = await sha256(password);
  if (user.passwordHash !== hash) return { ok: false, error: "Invalid email or password" };
  return { ok: true, user };
}

export function getSessionUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const db = cache ? cache : (JSON.parse(window.localStorage.getItem(DB_KEY) || "null") as DB | null);
    if (!db) return null;
    const session = JSON.parse(raw) as { userId: string };
    return db.users.find((u) => u.id === session.userId) || null;
  } catch {
    return null;
  }
}

export function setSession(userId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

// ---------- Classes ----------

export function getClasses(type?: string): GymClass[] {
  const db = cache;
  if (!db) return [];
  let list = db.classes;
  if (type && type !== "ALL") list = list.filter((c) => c.type === type);
  return list.map((c) => ({
    ...c,
    _count: {
      bookings: db.bookings.filter((b) => b.classId === c.id && b.status === "CONFIRMED").length,
      waitlists: db.waitlists.filter((w) => w.classId === c.id).length,
    },
  }));
}

export function getClassById(id: string): GymClass | undefined {
  return getClasses().find((c) => c.id === id);
}

export function getUserBooking(userId: string, classId: string): Booking | undefined {
  const db = cache;
  if (!db) return undefined;
  return db.bookings.find((b) => b.userId === userId && b.classId === classId && b.status === "CONFIRMED");
}

export function getUpcomingBookings(userId: string, limit = 10): (Booking & { class?: GymClass })[] {
  const db = cache;
  if (!db) return [];
  return db.bookings
    .filter((b) => b.userId === userId && b.status === "CONFIRMED")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
    .map((b) => ({ ...b, class: db.classes.find((c) => c.id === b.classId) }));
}

export function bookClass(
  userId: string,
  classId: string,
  date: string
): { ok: boolean; error?: string; waitlisted?: boolean } {
  const db = cache;
  if (!db) return { ok: false, error: "Not ready" };

  if (db.bookings.some((b) => b.userId === userId && b.classId === classId && b.status === "CONFIRMED")) {
    return { ok: false, error: "Already booked" };
  }

  const cls = db.classes.find((c) => c.id === classId);
  if (!cls) return { ok: false, error: "Class not found" };

  const count = db.bookings.filter((b) => b.classId === classId && b.status === "CONFIRMED").length;
  if (count >= cls.capacity) {
    const position = db.waitlists.filter((w) => w.classId === classId && w.date === date).length + 1;
    db.waitlists.push({ id: uid(), userId, classId, date, position });
    saveDB(db);
    return { ok: true, waitlisted: true };
  }

  db.bookings.push({ id: uid(), userId, classId, date, status: "CONFIRMED" });
  saveDB(db);
  return { ok: true };
}

export function cancelBooking(userId: string, classId: string): { ok: boolean; error?: string } {
  const db = cache;
  if (!db) return { ok: false, error: "Not ready" };
  const booking = db.bookings.find((b) => b.userId === userId && b.classId === classId && b.status === "CONFIRMED");
  if (!booking) return { ok: false, error: "No active booking" };
  booking.status = "CANCELLED";

  // Promote first waitlist entry
  const next = db.waitlists
    .filter((w) => w.classId === classId)
    .sort((a, b) => a.position - b.position)[0];
  if (next) {
    db.bookings.push({ id: uid(), userId: next.userId, classId, date: next.date, status: "CONFIRMED" });
    db.waitlists = db.waitlists.filter((w) => w.id !== next.id);
  }

  saveDB(db);
  return { ok: true };
}

// ---------- Workouts ----------

export function getWorkouts(type?: string, difficulty?: string): Workout[] {
  const db = cache;
  if (!db) return [];
  let list = db.workouts;
  if (type && type !== "ALL") list = list.filter((w) => w.type === type);
  if (difficulty && difficulty !== "ALL") list = list.filter((w) => w.difficulty === difficulty);
  return list.map((w) => ({ ...w, _count: { exercises: w.exercises.length } }));
}

export function getWorkoutById(id: string): Workout | undefined {
  const db = cache;
  if (!db) return undefined;
  const w = db.workouts.find((x) => x.id === id);
  if (!w) return undefined;
  return { ...w, _count: { exercises: w.exercises.length } };
}

export function logWorkout(userId: string, workoutId: string, duration: number): WorkoutLog {
  const db = cache!;
  const log: WorkoutLog = {
    id: uid(),
    userId,
    workoutId,
    date: todayStr(),
    duration,
  };
  db.workoutLogs.push(log);
  saveDB(db);
  return log;
}

export function getRecentLogs(userId: string, limit = 10): (WorkoutLog & { workout?: Workout })[] {
  const db = cache;
  if (!db) return [];
  return db.workoutLogs
    .filter((l) => l.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((l) => ({ ...l, workout: db.workouts.find((w) => w.id === l.workoutId) }));
}

// ---------- Profile ----------

export function getProfile(userId: string): User | undefined {
  const db = cache;
  if (!db) return undefined;
  return db.users.find((u) => u.id === userId);
}

export function updateProfile(userId: string, data: Partial<User>): User | undefined {
  const db = cache;
  if (!db) return undefined;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return undefined;
  Object.assign(user, data);
  saveDB(db);
  return user;
}

// ---------- Membership ----------

export function getMembership(userId: string): Membership {
  const db = cache!;
  const existing = db.memberships.find((m) => m.userId === userId);
  if (existing) return existing;
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  const m: Membership = {
    userId,
    plan: "BASIC",
    status: "ACTIVE",
    startDate: todayStr(),
    endDate: end.toISOString(),
    autoRenew: false,
  };
  db.memberships.push(m);
  saveDB(db);
  return m;
}

export function upgradeMembership(userId: string, plan: string): Membership {
  const db = cache!;
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  const m = getMembership(userId);
  m.plan = plan;
  m.status = "ACTIVE";
  m.endDate = end.toISOString();
  saveDB(db);
  return m;
}

// ---------- Payments ----------

export function getPayments(userId: string): Payment[] {
  const db = cache;
  if (!db) return [];
  return db.payments.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPayment(
  userId: string,
  amount: number,
  type: string,
  description: string
): Payment {
  const db = cache!;
  const p: Payment = {
    id: uid(),
    userId,
    amount,
    currency: "NGN",
    status: "COMPLETED",
    reference: "GB-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    type,
    description,
    createdAt: todayStr(),
  };
  db.payments.push(p);
  saveDB(db);
  return p;
}

// ---------- Progress ----------

export function getProgress(userId: string): ProgressEntry[] {
  const db = cache;
  if (!db) return [];
  return db.progress.filter((p) => p.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}

export function addProgress(userId: string, data: Partial<ProgressEntry>): ProgressEntry {
  const db = cache!;
  const entry: ProgressEntry = {
    id: uid(),
    userId,
    date: todayStr(),
    weight: data.weight,
    bodyFat: data.bodyFat,
    muscleMass: data.muscleMass,
    notes: data.notes,
  };
  db.progress.push(entry);
  saveDB(db);
  return entry;
}

export function deleteProgress(userId: string, id: string) {
  const db = cache!;
  db.progress = db.progress.filter((p) => p.id !== id || p.userId !== userId);
  saveDB(db);
}

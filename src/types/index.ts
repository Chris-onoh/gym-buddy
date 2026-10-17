export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: "MEMBER" | "ADMIN" | "INSTRUCTOR";
  weight: number | null;
  height: number | null;
  bodyFat: number | null;
  goals: string | null;
}

export interface MembershipPlan {
  plan: "BASIC" | "PREMIUM" | "ELITE";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  startDate: string;
  endDate: string;
}

export interface GymClass {
  id: string;
  name: string;
  description: string | null;
  type: ClassType;
  instructor: string;
  instructorBio: string | null;
  instructorImg: string | null;
  duration: number;
  capacity: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  image: string | null;
  _count?: { bookings: number; waitlists: number };
}

export type ClassType =
  | "YOGA"
  | "HIIT"
  | "STRENGTH"
  | "CARDIO"
  | "PILATES"
  | "SPINNING"
  | "ZUMBA"
  | "BOXING"
  | "CROSSFIT"
  | "MEDITATION";

export interface Booking {
  id: string;
  userId: string;
  classId: string;
  date: string;
  status: "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW";
  class?: GymClass;
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  classId: string;
  date: string;
  position: number;
}

export interface Workout {
  id: string;
  title: string;
  description: string | null;
  type: WorkoutType;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number;
  image: string | null;
  videoUrl: string | null;
  exercises: Exercise[];
}

export type WorkoutType =
  | "STRENGTH"
  | "CARDIO"
  | "HIIT"
  | "FLEXIBILITY"
  | "FULL_BODY"
  | "UPPER_BODY"
  | "LOWER_BODY"
  | "CORE";

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  restTime: number | null;
  description: string | null;
  videoUrl: string | null;
  order: number;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId: string | null;
  date: string;
  duration: number;
  notes: string | null;
  workout?: Workout;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  notes: string | null;
}

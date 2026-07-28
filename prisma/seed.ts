import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.workoutLog.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.class.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Alex Demo",
      email: "demo@example.com",
      password: hash,
      weight: 75,
      height: 175,
      bodyFat: 18,
      goals: "Build muscle and stay consistent",
    },
  });
  const end = new Date(); end.setFullYear(end.getFullYear() + 1);
  await prisma.membership.create({
    data: { userId: user.id, plan: "PREMIUM", status: "ACTIVE", endDate: end },
  });
  for (let i = 28; i >= 0; i -= 7) {
    await prisma.progress.create({
      data: {
        userId: user.id,
        date: new Date(Date.now() - i * 86400000),
        weight: 78 - i * 0.1,
        bodyFat: 20 - i * 0.07,
        muscleMass: 34 + i * 0.05,
      },
    });
  }
  console.log("✅ Demo user: demo@example.com / password123");

  // Create classes
  const classes = [
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

  for (const cls of classes) {
    await prisma.class.create({ data: cls });
  }
  console.log(`✅ Created ${classes.length} classes`);

  // Create workouts
  const workouts = [
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

  for (const w of workouts) {
    const { exercises, ...workoutData } = w;
    const workout = await prisma.workout.create({ data: workoutData });
    for (const ex of exercises) {
      await prisma.exercise.create({
        data: { ...ex, workoutId: workout.id },
      });
    }
  }
  console.log(`✅ Created ${workouts.length} workouts with exercises`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

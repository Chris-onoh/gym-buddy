"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getDB, getWorkoutById, logWorkout } from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Clock, BarChart3, Play, CheckCircle2, Timer } from "lucide-react";

export default function WorkoutDetailPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  const workout = ready ? getWorkoutById(String(params.id)) : undefined;

  const handleLog = () => {
    if (!user || !workout) return;
    logWorkout(user.id, workout.id, workout.duration);
    setLogged(true);
    setTimeout(() => setLogged(false), 3000);
  };

  if (loading || !user || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">Workout not found</p>
        <Link href="/workouts" className="text-sm text-primary-600 mt-2 inline-block">Back to workouts</Link>
      </div>
    );
  }

  const diffVariant = workout.difficulty === "BEGINNER" ? "success" : workout.difficulty === "INTERMEDIATE" ? "warning" : "danger";

  return (
    <div className="page-container max-w-3xl space-y-6">
      <Link href="/workouts" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to workouts
      </Link>

      <Card padding="lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{workout.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={diffVariant as any}>{workout.difficulty}</Badge>
          <Badge variant="info">{workout.type.replace("_", " ")}</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {workout.duration} minutes</span>
          <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {workout.exercises.length} exercises</span>
        </div>

        <p className="text-gray-600 mb-6">{workout.description}</p>

        {logged && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Workout logged successfully!
          </div>
        )}

        <Button onClick={handleLog} size="lg">
          <Play className="w-4 h-4 mr-2" /> Log This Workout
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
          <span className="text-sm text-gray-500">{workout.exercises.length} exercises</span>
        </CardHeader>
        <div className="space-y-3">
          {workout.exercises.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  {ex.sets && ex.reps && <span>{ex.sets} sets × {ex.reps} reps</span>}
                  {ex.duration && <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {ex.duration}s</span>}
                  {ex.restTime && <span>Rest: {ex.restTime}s</span>}
                </div>
                {ex.description && <p className="text-xs text-gray-400 mt-1">{ex.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

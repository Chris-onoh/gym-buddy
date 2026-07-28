"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Clock, BarChart3, Play, CheckCircle2, Timer } from "lucide-react";

export default function WorkoutDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetch(`/api/workouts/${params.id}`)
        .then((r) => r.json())
        .then(setWorkout)
        .catch(console.error);
    }
  }, [session, params.id]);

  const handleLogWorkout = async () => {
    setLogging(true);
    try {
      const res = await fetch("/api/workouts/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: params.id, duration: workout.duration }),
      });
      if (res.ok) {
        setLogSuccess(true);
        setTimeout(() => setLogSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const diffColor = (d: string) =>
    d === "BEGINNER" ? "success" : d === "INTERMEDIATE" ? "warning" : "danger";

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl space-y-6">
      <Link href="/workouts" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to workouts
      </Link>

      <Card padding="lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workout.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={diffColor(workout.difficulty) as any}>{workout.difficulty}</Badge>
              <Badge variant="info">{workout.type.replace("_", " ")}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {workout.duration} minutes</span>
          <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {workout.exercises?.length || 0} exercises</span>
        </div>

        <p className="text-gray-600 mb-6">{workout.description || "No description available."}</p>

        {logSuccess && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Workout logged successfully!
          </div>
        )}

        <Button onClick={handleLogWorkout} isLoading={logging} size="lg" className="w-full sm:w-auto">
          <Play className="w-4 h-4 mr-2" /> Log This Workout
        </Button>
      </Card>

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
          <span className="text-sm text-gray-500">{workout.exercises?.length || 0} exercises</span>
        </CardHeader>
        <div className="space-y-3">
          {(workout.exercises || []).map((ex: any, i: number) => (
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

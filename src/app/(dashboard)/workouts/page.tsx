"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dumbbell, Clock, BarChart3, Search } from "lucide-react";

const WORKOUT_TYPES = ["ALL", "STRENGTH", "CARDIO", "HIIT", "FLEXIBILITY", "FULL_BODY", "UPPER_BODY", "LOWER_BODY", "CORE"];
const DIFFICULTIES = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function WorkoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [diffFilter, setDiffFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchWorkouts();
  }, [session, typeFilter, diffFilter]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (diffFilter !== "ALL") params.set("difficulty", diffFilter);
      const res = await fetch(`/api/workouts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data.workouts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const diffColor = (d: string) =>
    d === "BEGINNER" ? "bg-green-100 text-green-700" :
    d === "INTERMEDIATE" ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-700";

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workout Library</h1>
        <p className="text-gray-600 mt-1">Find the perfect workout for your goals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {WORKOUT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                typeFilter === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t === "ALL" ? "All Types" : t.replace("_", " ").charAt(0) + t.replace("_", " ").slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              diffFilter === d ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {d === "ALL" ? "All Levels" : d.charAt(0) + d.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No workouts found</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((w) => (
            <Link key={w.id} href={`/workouts/${w.id}`}>
              <Card hover padding="md" className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <Badge className={diffColor(w.difficulty)}>{w.difficulty}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{w.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{w.description || "No description"}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {w.duration} min</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {w._count?.exercises || 0} exercises</span>
                </div>
                <div className="mt-2">
                  <Badge variant="info" size="sm">{w.type.replace("_", " ")}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

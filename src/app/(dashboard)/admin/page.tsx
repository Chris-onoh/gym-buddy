"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getDB,
  type User,
  type GymClass,
  type Booking,
  type Workout,
  type WorkoutLog,
  saveDB,
  resetDB,
} from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CalendarDays,
  Dumbbell,
  RotateCcw,
  Shield,
  Trash2,
  TrendingUp,
} from "lucide-react";

type Tab = "overview" | "classes" | "workouts" | "bookings";

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [, setTick] = useState(0);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container max-w-lg mx-auto py-12">
        <Card padding="lg">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin Access Required</h2>
            <p className="mt-2 text-gray-600">
              Please sign in as administrator to manage classes, workouts, and bookings.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={async () => {
                  const res = await login("admin", "admin");
                  if (res.ok) setTick((t) => t + 1);
                }}
              >
                Sign In as Admin
              </Button>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Go to Login Page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="page-container max-w-lg mx-auto py-12">
        <Card padding="lg">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Restricted Area</h2>
            <p className="mt-2 text-gray-600">
              Signed in as <strong>{user.name}</strong> ({user.role || "member"}). Admin access required.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={async () => {
                  const res = await login("admin", "admin");
                  if (res.ok) setTick((t) => t + 1);
                }}
              >
                Switch to Admin
              </Button>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Log in differently
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <AdminDashboard tab={tab} setTab={setTab} onLogout={logout} />;
}

function AdminDashboard({ tab, setTab, onLogout }: { tab: Tab; setTab: (t: Tab) => void; onLogout: () => void }) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const db = useMemo(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("gymbuddy_db_v1") : null;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, []);

  if (!db) return <p className="p-8 text-gray-500">No data loaded.</p>;

  const classes: GymClass[] = db.classes || [];
  const bookings: Booking[] = db.bookings || [];
  const workouts: Workout[] = db.workouts || [];
  const workoutLogs: WorkoutLog[] = db.workoutLogs || [];
  const users: User[] = db.users || [];

  const tabs: { key: Tab; label: string; icon: typeof Shield; count: number }[] = [
    { key: "overview", label: "Overview", icon: Shield, count: 0 },
    { key: "classes", label: "Classes", icon: CalendarDays, count: classes.length },
    { key: "workouts", label: "Workouts", icon: Dumbbell, count: workouts.length },
    { key: "bookings", label: "Bookings", icon: CalendarDays, count: bookings.length },
  ];

  function handleReset() {
    if (!confirm("Reset ALL data? This wipes everything and re-seeds fresh demo data.")) return;
    resetDB();
    onLogout();
    setTimeout(() => window.location.reload(), 300);
  }

  function deleteBooking(id: string) {
    db.bookings = db.bookings.filter((b: Booking) => b.id !== id);
    saveDB(db);
    refresh();
  }

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage classes, workouts and bookings.</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset All Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Classes", value: classes.length, icon: CalendarDays, color: "from-primary-500 to-primary-600" },
              { label: "Active Bookings", value: bookings.filter((b) => b.status === "CONFIRMED").length, icon: CalendarDays, color: "from-green-500 to-green-600" },
              { label: "Workouts", value: workouts.length, icon: Dumbbell, color: "from-accent-500 to-accent-600" },
              { label: "Workout Logs", value: workoutLogs.length, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} padding="sm" className="hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
              {bookings.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No bookings yet</p>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(0, 5).map((b) => {
                    const u = users.find((u) => u.id === b.userId);
                    const c = classes.find((c) => c.id === b.classId);
                    return (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u?.name || b.userId}</p>
                          <p className="text-xs text-gray-500">{c?.name} · {new Date(b.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={b.status === "CONFIRMED" ? "success" : "danger"} size="sm">{b.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Workout Logs</CardTitle></CardHeader>
              {workoutLogs.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No logs yet</p>
              ) : (
                <div className="space-y-2">
                  {workoutLogs.slice(0, 5).map((l) => {
                    const u = users.find((u) => u.id === l.userId);
                    const w = workouts.find((w) => w.id === l.workoutId);
                    return (
                      <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{w?.title || "Workout"}</p>
                          <p className="text-xs text-gray-500">{u?.name} · {l.duration} min · {new Date(l.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="info" size="sm">{w?.difficulty || "—"}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Classes */}
      {tab === "classes" && (
        <Card>
          <CardHeader><CardTitle>Class Schedule ({classes.length})</CardTitle></CardHeader>
          <div className="divide-y divide-gray-100">
            {classes.map((c) => {
              const booked = bookings.filter((b) => b.classId === c.id && b.status === "CONFIRMED").length;
              return (
                <div key={c.id} className="flex items-center justify-between py-3 px-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{DAYS[c.dayOfWeek]} · {c.startTime}–{c.endTime} · {c.room} · {c.instructor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge size="sm">{c.type}</Badge>
                    <Badge variant={booked >= c.capacity ? "danger" : "success"} size="sm">{booked}/{c.capacity}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Workouts */}
      {tab === "workouts" && (
        <Card>
          <CardHeader><CardTitle>Workout Library ({workouts.length})</CardTitle></CardHeader>
          <div className="divide-y divide-gray-100">
            {workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-3 px-1">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{w.title}</p>
                  <p className="text-xs text-gray-500">{w.exercises.length} exercises · {w.duration} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge size="sm">{w.type}</Badge>
                  <Badge variant={w.difficulty === "ADVANCED" ? "danger" : w.difficulty === "INTERMEDIATE" ? "warning" : "success"} size="sm">{w.difficulty}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bookings */}
      {tab === "bookings" && (
        <Card>
          <CardHeader><CardTitle>All Bookings ({bookings.length})</CardTitle></CardHeader>
          <div className="divide-y divide-gray-100">
            {bookings.map((b) => {
              const u = users.find((u) => u.id === b.userId);
              const c = classes.find((c) => c.id === b.classId);
              return (
                <div key={b.id} className="flex items-center justify-between py-3 px-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{u?.name || b.userId}</p>
                    <p className="text-xs text-gray-500">{c?.name || b.classId} · {new Date(b.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === "CONFIRMED" ? "success" : "danger"} size="sm">{b.status}</Badge>
                    <button onClick={() => deleteBooking(b.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && <p className="py-6 text-center text-sm text-gray-400">No bookings</p>}
          </div>
        </Card>
      )}
    </div>
  );
}

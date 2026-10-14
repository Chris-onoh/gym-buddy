"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getDB,
  type User,
  type GymClass,
  type Booking,
  type Workout,
  type WorkoutLog,
  type Payment,
  type Membership,
  saveDB,
  resetDB,
  addClass,
  deleteClass,
  addWorkout,
  deleteWorkout,
  updateUserRole,
  updateUserMembershipPlan,
  deleteUser,
  deleteBooking,
  deletePayment,
  bookClass,
  createPayment,
} from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CalendarDays,
  Dumbbell,
  RotateCcw,
  Shield,
  Trash2,
  TrendingUp,
  Plus,
  Users,
  CreditCard,
  X,
  UserCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

type Tab = "overview" | "classes" | "workouts" | "members" | "bookings" | "payments";

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleAdminLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    if (username.trim() !== "admin" || password !== "admin") {
      setLoginError("Incorrect administrator username or password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login("admin", "admin");
    setIsSubmitting(false);
    if (!result.ok) setLoginError(result.error || "Unable to sign in as administrator.");
  }

  if (user?.role !== "admin") {
    return (
      <div className="page-container mx-auto max-w-lg py-12">
        <Card padding="lg">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-balance text-gray-900">Administrator sign in</h2>
            <p className="mt-2 text-pretty text-gray-600">Enter the administrator username and password to continue.</p>
          </div>
          <form onSubmit={handleAdminLogin} className="mt-6 space-y-5">
            {loginError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loginError}</p>}
            <Input
              label="Username"
              type="text"
              id="admin-username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              id="admin-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">Log in as admin</Button>
          </form>
        </Card>
      </div>
    );
  }

  return <AdminDashboard tab={tab} setTab={setTab} onLogout={logout} />;
}

function AdminDashboard({ tab, setTab, onLogout }: { tab: Tab; setTab: (t: Tab) => void; onLogout: () => void }) {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  // Modals state
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Forms state
  const [newClass, setNewClass] = useState({
    name: "", description: "", type: "HIIT", instructor: "", instructorBio: "",
    duration: 45, capacity: 20, dayOfWeek: 1, startTime: "09:00", endTime: "09:45", room: "Studio A"
  });

  const [newWorkout, setNewWorkout] = useState({
    title: "", description: "", type: "FULL_BODY", difficulty: "BEGINNER", duration: 30,
    exName: "", exSets: 3, exReps: 12, exRest: 60
  });

  const [newBooking, setNewBooking] = useState({ userId: "", classId: "" });
  const [newPayment, setNewPayment] = useState({ userId: "", amount: 15000, type: "MEMBERSHIP", description: "Monthly Membership" });

  const db = useMemo(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("gymbuddy_db_v1") : null;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, [tick]);

  if (!db) return <p className="p-8 text-gray-500">No data loaded.</p>;

  const classes: GymClass[] = db.classes || [];
  const bookings: Booking[] = db.bookings || [];
  const workouts: Workout[] = db.workouts || [];
  const workoutLogs: WorkoutLog[] = db.workoutLogs || [];
  const users: User[] = db.users || [];
  const payments: Payment[] = db.payments || [];
  const memberships: Membership[] = db.memberships || [];

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const tabs: { key: Tab; label: string; icon: typeof Shield; count: number }[] = [
    { key: "overview", label: "Overview", icon: Shield, count: 0 },
    { key: "classes", label: "Classes", icon: CalendarDays, count: classes.length },
    { key: "workouts", label: "Workouts", icon: Dumbbell, count: workouts.length },
    { key: "members", label: "Members", icon: Users, count: users.filter((u) => u.role !== "admin").length },
    { key: "bookings", label: "Bookings", icon: CalendarDays, count: bookings.length },
    { key: "payments", label: "Payments", icon: CreditCard, count: payments.length },
  ];

  function handleReset() {
    if (!confirm("Reset ALL data? Wipes current state and re-seeds fresh practical demo data.")) return;
    resetDB();
    onLogout();
    setTimeout(() => window.location.reload(), 300);
  }

  function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClass.name || !newClass.instructor) return;
    addClass(newClass);
    setShowAddClass(false);
    setNewClass({
      name: "", description: "", type: "HIIT", instructor: "", instructorBio: "",
      duration: 45, capacity: 20, dayOfWeek: 1, startTime: "09:00", endTime: "09:45", room: "Studio A"
    });
    refresh();
  }

  function handleCreateWorkout(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkout.title) return;
    addWorkout({
      title: newWorkout.title,
      description: newWorkout.description,
      type: newWorkout.type,
      difficulty: newWorkout.difficulty,
      duration: Number(newWorkout.duration),
      exercises: [
        { name: newWorkout.exName || "Main Exercise", sets: Number(newWorkout.exSets), reps: Number(newWorkout.exReps), restTime: Number(newWorkout.exRest), order: 0 }
      ]
    });
    setShowAddWorkout(false);
    setNewWorkout({ title: "", description: "", type: "FULL_BODY", difficulty: "BEGINNER", duration: 30, exName: "", exSets: 3, exReps: 12, exRest: 60 });
    refresh();
  }

  function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!newBooking.userId || !newBooking.classId) return;
    const cls = classes.find((c) => c.id === newBooking.classId);
    const dateStr = new Date().toISOString();
    bookClass(newBooking.userId, newBooking.classId, dateStr);
    setShowAddBooking(false);
    refresh();
  }

  function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!newPayment.userId || !newPayment.amount) return;
    createPayment(newPayment.userId, Number(newPayment.amount), newPayment.type, newPayment.description);
    setShowAddPayment(false);
    refresh();
  }

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Admin Operations Center
          </h1>
          <p className="text-gray-600 mt-1">Real-time management for gym classes, workouts, members & payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset & Reseed Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "from-green-500 to-green-600" },
              { label: "Active Members", value: users.filter((u) => u.role !== "admin").length, icon: Users, color: "from-blue-500 to-blue-600" },
              { label: "Gym Classes", value: classes.length, icon: CalendarDays, color: "from-primary-500 to-primary-600" },
              { label: "Workouts", value: workouts.length, icon: Dumbbell, color: "from-purple-500 to-purple-600" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} padding="sm" className="hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Recent Transactions</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setTab("payments")}>View All</Button>
              </CardHeader>
              <div className="space-y-2">
                {payments.slice(0, 5).map((p) => {
                  const u = users.find((u) => u.id === p.userId);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u?.name || "Member"}</p>
                        <p className="text-xs text-gray-500">{p.description} · {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">₦{p.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Class Bookings Stream</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setTab("bookings")}>Manage Bookings</Button>
              </CardHeader>
              <div className="space-y-2">
                {bookings.slice(0, 5).map((b) => {
                  const u = users.find((u) => u.id === b.userId);
                  const c = classes.find((c) => c.id === b.classId);
                  return (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u?.name || b.userId}</p>
                        <p className="text-xs text-gray-500">{c?.name || "Gym Class"} · {new Date(b.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={b.status === "CONFIRMED" ? "success" : "danger"} size="sm">{b.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* CLASSES TAB */}
      {tab === "classes" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Gym Schedule & Classes ({classes.length})</CardTitle>
            <Button size="sm" onClick={() => setShowAddClass(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add New Class
            </Button>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {classes.map((c) => {
              const booked = bookings.filter((b) => b.classId === c.id && b.status === "CONFIRMED").length;
              return (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{c.name}</h4>
                      <Badge size="sm">{c.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{c.description}</p>
                    <p className="text-xs text-gray-500">
                      Instructor: <strong>{c.instructor}</strong> · Day: <strong>{DAYS[c.dayOfWeek]}</strong> ({c.startTime} - {c.endTime}) · Room: <strong>{c.room}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={booked >= c.capacity ? "danger" : "success"}>
                      {booked}/{c.capacity} Enrolled
                    </Badge>
                    <button
                      onClick={() => {
                        if (confirm(`Delete class "${c.name}"?`)) {
                          deleteClass(c.id);
                          refresh();
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* WORKOUTS TAB */}
      {tab === "workouts" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Workout Routines ({workouts.length})</CardTitle>
            <Button size="sm" onClick={() => setShowAddWorkout(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Workout Routine
            </Button>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {workouts.map((w) => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{w.title}</h4>
                    <Badge size="sm">{w.difficulty}</Badge>
                    <Badge variant="info" size="sm">{w.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{w.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: <strong>{w.duration} mins</strong> · Exercises: <strong>{w.exercises?.length || 0}</strong> ({w.exercises?.map((e) => e.name).join(", ")})
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete workout "${w.title}"?`)) {
                      deleteWorkout(w.id);
                      refresh();
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Workout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MEMBERS TAB */}
      {tab === "members" && (
        <Card>
          <CardHeader><CardTitle>Registered Members ({users.length})</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Membership Plan</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const mem = memberships.find((m) => m.userId === u.id);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="p-3 text-gray-600">{u.phone || "—"}</td>
                      <td className="p-3">
                        <select
                          value={u.role || "member"}
                          onChange={(e) => {
                            updateUserRole(u.id, e.target.value as "member" | "admin");
                            refresh();
                          }}
                          className="text-xs font-semibold rounded-lg border border-gray-300 p-1 bg-white"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={mem?.plan || "BASIC"}
                          onChange={(e) => {
                            updateUserMembershipPlan(u.id, e.target.value);
                            refresh();
                          }}
                          className="text-xs font-semibold rounded-lg border border-gray-300 p-1 bg-white"
                        >
                          <option value="BASIC">BASIC (₦15,000)</option>
                          <option value="PREMIUM">PREMIUM (₦35,000)</option>
                          <option value="ELITE">ELITE (₦65,000)</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        {u.email !== "admin@gymbuddy.com" && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove member "${u.name}"?`)) {
                                deleteUser(u.id);
                                refresh();
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* BOOKINGS TAB */}
      {tab === "bookings" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Class Bookings ({bookings.length})</CardTitle>
            <Button size="sm" onClick={() => setShowAddBooking(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Booking for Member
            </Button>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {bookings.map((b) => {
              const u = users.find((u) => u.id === b.userId);
              const c = classes.find((c) => c.id === b.classId);
              return (
                <div key={b.id} className="flex items-center justify-between py-3 px-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{u?.name || b.userId}</p>
                    <p className="text-xs text-gray-500">{c?.name || "Class"} · {new Date(b.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={b.status === "CONFIRMED" ? "success" : "danger"}>{b.status}</Badge>
                    <button
                      onClick={() => {
                        deleteBooking(b.id);
                        refresh();
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* PAYMENTS TAB */}
      {tab === "payments" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaction & Revenue Logs ({payments.length})</CardTitle>
              <p className="text-xs text-green-600 font-bold mt-1">Total Accumulated: ₦{totalRevenue.toLocaleString()}</p>
            </div>
            <Button size="sm" onClick={() => setShowAddPayment(true)}>
              <Plus className="w-4 h-4 mr-1" /> Record New Payment
            </Button>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {payments.map((p) => {
              const u = users.find((u) => u.id === p.userId);
              return (
                <div key={p.id} className="flex items-center justify-between py-3 px-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{u?.name || "Member"} <span className="text-xs text-gray-400">({p.reference})</span></p>
                    <p className="text-xs text-gray-500">{p.description} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-green-600">₦{p.amount.toLocaleString()}</span>
                    <button
                      onClick={() => {
                        deletePayment(p.id);
                        refresh();
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* MODAL: ADD CLASS */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900">Add New Gym Class</h3>
              <button onClick={() => setShowAddClass(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <Input label="Class Name" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} required />
              <Input label="Description" value={newClass.description} onChange={(e) => setNewClass({ ...newClass, description: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Instructor" value={newClass.instructor} onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })} required />
                <Input label="Room" value={newClass.room} onChange={(e) => setNewClass({ ...newClass, room: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Category</label>
                  <select className="w-full p-2 text-sm border rounded-xl" value={newClass.type} onChange={(e) => setNewClass({ ...newClass, type: e.target.value })}>
                    {["HIIT", "YOGA", "STRENGTH", "CARDIO", "PILATES", "SPINNING", "BOXING", "CROSSFIT"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Input label="Capacity" type="number" value={newClass.capacity} onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) })} required />
                <Input label="Duration (m)" type="number" value={newClass.duration} onChange={(e) => setNewClass({ ...newClass, duration: Number(e.target.value) })} required />
              </div>
              <Button type="submit" className="w-full mt-4">Create Class</Button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: ADD WORKOUT */}
      {showAddWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900">Add Workout Routine</h3>
              <button onClick={() => setShowAddWorkout(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateWorkout} className="space-y-3">
              <Input label="Routine Title" value={newWorkout.title} onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })} required />
              <Input label="Description" value={newWorkout.description} onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })} required />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Duration (min)" type="number" value={newWorkout.duration} onChange={(e) => setNewWorkout({ ...newWorkout, duration: Number(e.target.value) })} required />
                <div>
                  <label className="text-xs font-semibold text-gray-700">Difficulty</label>
                  <select className="w-full p-2 text-sm border rounded-xl" value={newWorkout.difficulty} onChange={(e) => setNewWorkout({ ...newWorkout, difficulty: e.target.value })}>
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Target Type</label>
                  <select className="w-full p-2 text-sm border rounded-xl" value={newWorkout.type} onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}>
                    <option value="FULL_BODY">FULL_BODY</option>
                    <option value="UPPER_BODY">UPPER_BODY</option>
                    <option value="LOWER_BODY">LOWER_BODY</option>
                    <option value="CORE">CORE</option>
                    <option value="HIIT">HIIT</option>
                  </select>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Initial Exercise</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Exercise Name" value={newWorkout.exName} onChange={(e) => setNewWorkout({ ...newWorkout, exName: e.target.value })} placeholder="Squats" />
                  <Input label="Sets / Reps" value={`${newWorkout.exSets} sets x ${newWorkout.exReps} reps`} disabled />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">Save Routine</Button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: ADD BOOKING */}
      {showAddBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900">Manual Booking</h3>
              <button onClick={() => setShowAddBooking(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Select Member</label>
                <select className="w-full p-2 text-sm border rounded-xl" value={newBooking.userId} onChange={(e) => setNewBooking({ ...newBooking, userId: e.target.value })} required>
                  <option value="">-- Choose Member --</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Select Class</label>
                <select className="w-full p-2 text-sm border rounded-xl" value={newBooking.classId} onChange={(e) => setNewBooking({ ...newBooking, classId: e.target.value })} required>
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.instructor})</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full mt-4">Confirm Booking</Button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: ADD PAYMENT */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900">Record Payment Transaction</h3>
              <button onClick={() => setShowAddPayment(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreatePayment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Select Member</label>
                <select className="w-full p-2 text-sm border rounded-xl" value={newPayment.userId} onChange={(e) => setNewPayment({ ...newPayment, userId: e.target.value })} required>
                  <option value="">-- Choose Member --</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <Input label="Amount (NGN)" type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })} required />
              <Input label="Description" value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} required />
              <div>
                <label className="text-xs font-semibold text-gray-700">Type</label>
                <select className="w-full p-2 text-sm border rounded-xl" value={newPayment.type} onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}>
                  <option value="MEMBERSHIP">MEMBERSHIP</option>
                  <option value="PT_SESSION">PT_SESSION</option>
                  <option value="SUPPLEMENTS">SUPPLEMENTS</option>
                  <option value="CLASS_PACK">CLASS_PACK</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-4">Save Transaction</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

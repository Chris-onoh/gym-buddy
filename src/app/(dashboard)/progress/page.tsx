"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDB, getProgress, addProgress, deleteProgress } from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { TrendingUp, Weight, Activity, Plus, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight: "", bodyFat: "", muscleMass: "", notes: "" });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  if (loading || !user || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const entries = getProgress(user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProgress(user.id, {
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
      muscleMass: form.muscleMass ? parseFloat(form.muscleMass) : undefined,
      notes: form.notes || undefined,
    });
    setShowForm(false);
    setForm({ weight: "", bodyFat: "", muscleMass: "", notes: "" });
    setVersion(version + 1);
  };

  const handleDelete = (id: string) => {
    deleteProgress(user.id, id);
    setVersion(version + 1);
  };

  const chartData = [...entries].reverse().map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
    weight: e.weight,
    bodyFat: e.bodyFat,
    muscleMass: e.muscleMass,
  }));

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your fitness journey</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Log Entry"}
        </Button>
      </div>

      {showForm && (
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Weight (kg)" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} icon={<Weight className="w-4 h-4" />} placeholder="75.0" />
              <Input label="Body Fat (%)" type="number" step="0.1" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} placeholder="18.0" />
              <Input label="Muscle Mass (kg)" type="number" step="0.1" value={form.muscleMass} onChange={(e) => setForm({ ...form, muscleMass: e.target.value })} icon={<Activity className="w-4 h-4" />} placeholder="35.0" />
            </div>
            <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="How are you feeling? Any PRs?" />
            <Button type="submit">Save Entry</Button>
          </form>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Progress Chart</CardTitle></CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
                <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Body Fat (%)" />
                <Line type="monotone" dataKey="muscleMass" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Muscle Mass (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entry History</CardTitle>
          <span className="text-sm text-gray-500">{entries.length} entries</span>
        </CardHeader>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No entries yet</p>
            <p className="text-sm mt-1">Start logging your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                  <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-sm">{formatDate(e.date)}</p></div>
                  <div><p className="text-xs text-gray-500">Weight</p><p className="font-medium text-sm">{e.weight ? `${e.weight} kg` : "-"}</p></div>
                  <div><p className="text-xs text-gray-500">Body Fat</p><p className="font-medium text-sm">{e.bodyFat ? `${e.bodyFat}%` : "-"}</p></div>
                  <div><p className="text-xs text-gray-500">Muscle Mass</p><p className="font-medium text-sm">{e.muscleMass ? `${e.muscleMass} kg` : "-"}</p></div>
                </div>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {entries.length > 0 && (() => {
        const start = entries[entries.length - 1];
        const current = entries[0];
        const change = start?.weight && current?.weight ? (current.weight - start.weight).toFixed(1) : null;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Starting Weight", value: start?.weight ? `${start.weight} kg` : "-" },
              { label: "Current Weight", value: current?.weight ? `${current.weight} kg` : "-" },
              { label: "Change", value: change ? `${change} kg` : "-" },
              { label: "Total Entries", value: entries.length.toString() },
            ].map((s, i) => (
              <Card key={i} padding="sm">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </Card>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

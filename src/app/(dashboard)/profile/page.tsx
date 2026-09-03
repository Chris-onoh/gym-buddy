"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDB, getProfile, updateProfile } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { User, Mail, Phone, Weight, Ruler, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", weight: "", height: "", bodyFat: "", goals: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (user && ready) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        weight: user.weight?.toString() || "",
        height: user.height?.toString() || "",
        bodyFat: user.bodyFat?.toString() || "",
        goals: user.goals || "",
      });
    }
  }, [user, ready]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    updateProfile(user.id, {
      name: form.name,
      phone: form.phone,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
      goals: form.goals || undefined,
    });
    refresh();
    setMessage("Profile updated successfully!");
    setSaving(false);
  };

  if (loading || !user || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and fitness goals</p>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {form.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{form.name || "User"}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" id="name" icon={<User className="w-4 h-4" />} value={form.name} onChange={handleChange("name")} />
            <Input label="Email" id="email" icon={<Mail className="w-4 h-4" />} value={user.email} disabled />
          </div>
          <Input label="Phone" id="phone" icon={<Phone className="w-4 h-4" />} value={form.phone} onChange={handleChange("phone")} placeholder="+234..." />

          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Body Metrics</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Weight (kg)" id="weight" type="number" icon={<Weight className="w-4 h-4" />} value={form.weight} onChange={handleChange("weight")} placeholder="75" step="0.1" />
              <Input label="Height (cm)" id="height" type="number" icon={<Ruler className="w-4 h-4" />} value={form.height} onChange={handleChange("height")} placeholder="175" step="0.1" />
              <Input label="Body Fat (%)" id="bodyFat" type="number" value={form.bodyFat} onChange={handleChange("bodyFat")} placeholder="18" step="0.1" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Fitness Goals</h3>
            <Textarea
              label="Your Goals"
              id="goals"
              rows={3}
              value={form.goals}
              onChange={handleChange("goals")}
              placeholder="e.g., Lose 5kg in 3 months, build muscle, improve flexibility..."
            />
          </div>

          <Button type="submit" isLoading={saving} size="lg" className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}

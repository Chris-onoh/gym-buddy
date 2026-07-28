"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { User, Mail, Phone, Weight, Ruler, Target, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", weight: "", height: "", bodyFat: "", goals: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          setForm({
            name: data.name || session.user?.name || "",
            email: data.email || session.user?.email || "",
            phone: data.phone || "",
            weight: data.weight?.toString() || "",
            height: data.height?.toString() || "",
            bodyFat: data.bodyFat?.toString() || "",
            goals: data.goals || "",
          });
        })
        .catch(console.error);
    }
  }, [session]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          weight: form.weight ? parseFloat(form.weight) : null,
          height: form.height ? parseFloat(form.height) : null,
          bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : null,
          goals: form.goals || null,
        }),
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
        update();
      } else {
        const d = await res.json();
        setMessage(d.error || "Update failed");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and fitness goals</p>
      </div>

      <Card padding="lg">
        {/* Avatar */}
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
            <p className="text-sm text-gray-500">{form.email}</p>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm mb-6 ${
            message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" id="name" icon={<User className="w-4 h-4" />} value={form.name} onChange={handleChange("name")} />
            <Input label="Email" id="email" icon={<Mail className="w-4 h-4" />} value={form.email} disabled />
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

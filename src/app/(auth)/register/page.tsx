"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Dumbbell, Mail, Lock, User, Phone } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const result = await register(formData.name, formData.email, formData.password, formData.phone);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">GymBuddy</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-1">Start your fitness journey today</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 animate-slide-down">
                {error}
              </div>
            )}
            <Input label="Full Name" type="text" id="name" placeholder="John Doe"
              icon={<User className="w-4 h-4" />} value={formData.name} onChange={handleChange("name")} required />
            <Input label="Email" type="email" id="email" placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />} value={formData.email} onChange={handleChange("email")} required />
            <Input label="Phone (optional)" type="tel" id="phone" placeholder="+234..."
              icon={<Phone className="w-4 h-4" />} value={formData.phone} onChange={handleChange("phone")} />
            <Input label="Password" type="password" id="password" placeholder="Min. 6 characters"
              icon={<Lock className="w-4 h-4" />} value={formData.password} onChange={handleChange("password")} required />
            <Input label="Confirm Password" type="password" id="confirmPassword" placeholder="Re-enter password"
              icon={<Lock className="w-4 h-4" />} value={formData.confirmPassword} onChange={handleChange("confirmPassword")} required />
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

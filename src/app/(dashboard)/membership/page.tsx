"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MEMBERSHIP_PLANS, formatDate, formatCurrency } from "@/lib/utils";
import { Check, CreditCard, Calendar } from "lucide-react";

export default function MembershipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => { if (session?.user) fetch("/api/membership").then(r => r.json()).then(d => { setMembership(d); setLoading(false); }).catch(() => setLoading(false)); }, [session]);

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan);
    try {
      await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const res = await fetch("/api/membership");
      if (res.ok) setMembership(await res.json());
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  const currentPlan = membership?.plan || "NONE";
  const isActive = membership?.status === "ACTIVE";

  return (
    <div className="page-container space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Membership</h1><p className="text-gray-600 mt-1">Manage your plan and billing</p></div>

      {isActive && (
        <Card>
          <CardHeader><CardTitle>Current Plan</CardTitle><Badge variant="success">Active</Badge></CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100">
            <div>
              <p className="text-2xl font-bold text-primary-700">{currentPlan}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Started: {formatDate(membership.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Expires: {formatDate(membership.endDate)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.plan;
          return (
            <Card key={plan.plan} padding="md" className={isCurrent ? "ring-2 ring-primary-500" : ""}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                {plan.popular && <Badge variant="warning" size="sm">Popular</Badge>}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(plan.price)}</span>
                <span className="text-gray-500 text-sm ml-1">/{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "outline" : "primary"}
                className="w-full"
                disabled={isCurrent}
                isLoading={upgrading === plan.plan}
                onClick={() => handleUpgrade(plan.plan)}
              >
                {isCurrent ? "Current Plan" : plan.plan === "PAY_AS_YOU_GO" ? "Select" : "Upgrade"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

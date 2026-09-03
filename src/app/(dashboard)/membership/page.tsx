"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDB, getMembership, upgradeMembership } from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MEMBERSHIP_PLANS, formatDate, formatCurrency } from "@/lib/utils";
import { Check, Calendar } from "lucide-react";

export default function MembershipPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

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

  const membership = getMembership(user.id);
  const isActive = membership.status === "ACTIVE";

  const handleUpgrade = (plan: string) => {
    upgradeMembership(user.id, plan);
    setVersion(version + 1);
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Membership</h1>
        <p className="text-gray-600 mt-1">Manage your plan and billing</p>
      </div>

      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="success">Active</Badge>
          </CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100">
            <div>
              <p className="text-2xl font-bold text-primary-700">{membership.plan}</p>
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
          const isCurrent = membership.plan === plan.plan;
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
                onClick={() => handleUpgrade(plan.plan)}
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

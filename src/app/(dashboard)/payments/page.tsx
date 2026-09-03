"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDB, getPayments, createPayment } from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt, ArrowUp, CreditCard, RefreshCw, Wallet } from "lucide-react";

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState("");

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

  const payments = getPayments(user.id);

  const handleTopUp = () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return;
    createPayment(user.id, parseFloat(topUpAmount), "CLASS_PACK", "Class pack purchase");
    setTopUpAmount("");
    setVersion(version + 1);
  };

  const statusVariant = (s: string) => s === "COMPLETED" ? "success" : s === "PENDING" ? "warning" : s === "FAILED" ? "danger" : "info";
  const completed = payments.filter((p) => p.status === "COMPLETED");

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Billing</h1>
        <p className="text-gray-600 mt-1">Manage your payments and top up credits</p>
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <Input
              label="Top Up Amount (₦)"
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="5000"
              icon={<Wallet className="w-4 h-4" />}
            />
          </div>
          <Button onClick={handleTopUp} size="lg">Top Up Now</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Spent", value: formatCurrency(completed.reduce((s: number, p: any) => s + p.amount, 0)), icon: ArrowUp, color: "text-red-600" },
          { label: "Completed", value: completed.length, icon: CreditCard, color: "text-green-600" },
          { label: "Pending", value: payments.filter((p) => p.status === "PENDING").length, icon: RefreshCw, color: "text-yellow-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} padding="sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${s.color}`}><Icon className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-3 font-mono text-xs">{p.reference}</td>
                    <td className="py-3 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="py-3 text-gray-500">{p.type?.replace("_", " ")}</td>
                    <td className="py-3"><Badge variant={statusVariant(p.status) as any} size="sm">{p.status}</Badge></td>
                    <td className="py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

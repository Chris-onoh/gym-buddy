"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getDB, getClassById, getUserBooking, bookClass, cancelBooking } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CLASS_TYPE_ICONS, CLASS_TYPE_COLORS, DAYS_OF_WEEK, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, Users, User, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ClassDetailPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  const cls = ready ? getClassById(String(params.id)) : undefined;

  useEffect(() => {
    if (cls) {
      const today = new Date();
      const daysUntil = (cls.dayOfWeek - today.getDay() + 7) % 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      setSelectedDate(nextDate.toISOString().split("T")[0]);
    }
  }, [cls]);

  if (loading || !user || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">Class not found</p>
        <Link href="/classes" className="text-sm text-primary-600 mt-2 inline-block">Back to classes</Link>
      </div>
    );
  }

  const bookedCount = cls._count?.bookings || 0;
  const waitlistCount = cls._count?.waitlists || 0;
  const isFull = bookedCount >= cls.capacity;
  const isBooked = !!getUserBooking(user.id, cls.id);

  const handleBook = () => {
    const result = bookClass(user.id, cls.id, new Date(selectedDate).toISOString());
    if (result.ok) {
      setMsgType("success");
      setMsg(result.waitlisted ? "You've joined the waitlist! We'll notify you if a spot opens." : "Class booked successfully! 🎉");
    } else {
      setMsgType("error");
      setMsg(result.error || "Booking failed");
    }
  };

  const handleCancel = () => {
    const result = cancelBooking(user.id, cls.id);
    setMsgType(result.ok ? "success" : "error");
    setMsg(result.ok ? "Booking cancelled" : result.error || "Cancellation failed");
  };

  return (
    <div className="page-container max-w-3xl space-y-6">
      <Link href="/classes" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to classes
      </Link>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{CLASS_TYPE_ICONS[cls.type] || "💪"}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
            <Badge className={`mt-1 ${CLASS_TYPE_COLORS[cls.type] || ""}`}>{cls.type}</Badge>
          </div>
        </div>

        <p className="text-gray-600 mb-6">{cls.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600"><CalendarDays className="w-4 h-4 text-gray-400" /> {DAYS_OF_WEEK[cls.dayOfWeek]}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" /> {formatTime(cls.startTime)} - {formatTime(cls.endTime)} ({cls.duration} min)</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {cls.room}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600"><User className="w-4 h-4 text-gray-400" /> {cls.instructor}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              {bookedCount}/{cls.capacity} spots filled{isFull && <span className="text-red-500 font-medium">(Full)</span>}
            </div>
            {waitlistCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600"><AlertCircle className="w-4 h-4" /> {waitlistCount} on waitlist</div>
            )}
          </div>
        </div>

        {cls.instructorBio && (
          <div className="p-4 rounded-xl bg-gray-50 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">About {cls.instructor}</p>
            <p className="text-sm text-gray-600">{cls.instructorBio}</p>
          </div>
        )}

        {msg && (
          <div className={`p-3 rounded-xl border text-sm mb-4 flex items-center gap-2 ${
            msgType === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <CheckCircle className="w-4 h-4" /> {msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {isBooked ? (
            <Button variant="danger" onClick={handleCancel}>Cancel Booking</Button>
          ) : (
            <Button onClick={handleBook} disabled={isFull}>
              {isFull ? "Join Waitlist" : "Book Now"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CLASS_TYPE_ICONS, CLASS_TYPE_COLORS, DAYS_OF_WEEK, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, Users, User, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ClassDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [cls, setCls] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) fetchClass();
  }, [session, params.id]);

  const fetchClass = async () => {
    try {
      const res = await fetch(`/api/classes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCls(data);

        // Set next occurrence date
        const today = new Date();
        const dayOfWeek = data.dayOfWeek;
        const daysUntil = (dayOfWeek - today.getDay() + 7) % 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + (daysUntil === 0 ? 0 : daysUntil));
        setSelectedDate(nextDate.toISOString().split("T")[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async () => {
    setBookingStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/classes/${params.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingStatus("success");
        fetchClass();
      } else {
        setErrorMsg(data.error || "Booking failed");
        setBookingStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong");
      setBookingStatus("error");
    }
  };

  const handleCancel = async () => {
    setBookingStatus("loading");
    try {
      const res = await fetch(`/api/classes/${params.id}/book`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      if (res.ok) {
        setBookingStatus("success");
        fetchClass();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Cancellation failed");
        setBookingStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong");
      setBookingStatus("error");
    }
  };

  if (!cls) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const icon = CLASS_TYPE_ICONS[cls.type] || "💪";
  const colorClass = CLASS_TYPE_COLORS[cls.type] || "";
  const bookedCount = cls._count?.bookings || 0;
  const waitlistCount = cls._count?.waitlists || 0;
  const isFull = bookedCount >= cls.capacity;
  const isBooked = cls.userBooking;

  return (
    <div className="page-container max-w-3xl space-y-6">
      <Link href="/classes" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to classes
      </Link>

      <Card padding="lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
              <Badge className={`mt-1 ${colorClass}`}>{cls.type}</Badge>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">{cls.description || "No description available."}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-gray-400" /> {DAYS_OF_WEEK[cls.dayOfWeek]}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" /> {formatTime(cls.startTime)} - {formatTime(cls.endTime)} ({cls.duration} min)
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" /> {cls.room || "Main Studio"}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" /> {cls.instructor}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              {bookedCount}/{cls.capacity} spots filled
              {isFull && <span className="text-red-500 font-medium">(Full)</span>}
            </div>
            {waitlistCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" /> {waitlistCount} on waitlist
              </div>
            )}
          </div>
        </div>

        {cls.instructorBio && (
          <div className="p-4 rounded-xl bg-gray-50 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">About {cls.instructor}</p>
            <p className="text-sm text-gray-600">{cls.instructorBio}</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
            {errorMsg}
          </div>
        )}

        {bookingStatus === "success" && !isBooked && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Booking cancelled successfully
          </div>
        )}
        {bookingStatus === "success" && isBooked && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Class booked successfully!
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {isBooked ? (
            <Button variant="danger" onClick={handleCancel} isLoading={bookingStatus === "loading"}>
              Cancel Booking
            </Button>
          ) : (
            <Button
              onClick={handleBook}
              isLoading={bookingStatus === "loading"}
              disabled={isFull}
            >
              {isFull ? "Join Waitlist" : "Book Now"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { Dumbbell, CalendarDays, TrendingUp, Users, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 font-display">
                GymBuddy
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#plans"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Plans
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Testimonials
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
              Now accepting new members
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 font-display leading-tight">
              Your Ultimate{" "}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                Fitness Companion
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Book classes, track workouts, manage your membership, and crush
              your fitness goals — all from one powerful platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              Everything you need to{" "}
              <span className="text-primary-600">stay on track</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We've built the tools to make your fitness journey seamless, from
              booking classes to tracking progress.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CalendarDays,
                title: "Class Scheduling",
                description:
                  "Browse and book classes in real-time. Filter by type, instructor, or time. Never miss your favorite class again.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Dumbbell,
                title: "Workout Library",
                description:
                  "Access hundreds of guided workouts with video instructions. From beginner to advanced, there's something for everyone.",
                color: "from-primary-500 to-primary-600",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description:
                  "Log your weight, body fat, and personal records. Visualize your transformation with beautiful charts and insights.",
                color: "from-accent-500 to-accent-600",
              },
              {
                icon: Users,
                title: "Community & Support",
                description:
                  "Connect with instructors and fellow members. Get motivated, share tips, and celebrate achievements together.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Star,
                title: "Membership Management",
                description:
                  "Upgrade, renew, or manage your membership in seconds. Flexible plans that fit your lifestyle and budget.",
                color: "from-yellow-500 to-yellow-600",
              },
              {
                icon: Users,
                title: "Smart Notifications",
                description:
                  "Stay updated with class reminders, promotions, and events. Never miss an important update from your gym.",
                color: "from-pink-500 to-pink-600",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              Choose your{" "}
              <span className="text-primary-600">plan</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Flexible options designed to fit your fitness goals and budget.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Basic",
                price: "₦15,000",
                period: "/month",
                features: [
                  "Gym floor access",
                  "5 group classes/month",
                  "Locker room access",
                ],
                popular: false,
              },
              {
                name: "Premium",
                price: "₦35,000",
                period: "/month",
                features: [
                  "Unlimited gym access",
                  "Unlimited group classes",
                  "Locker room + sauna",
                  "1 PT session/month",
                  "Progress tracking",
                ],
                popular: true,
              },
              {
                name: "Elite",
                price: "₦65,000",
                period: "/month",
                features: [
                  "All Premium features",
                  "4 PT sessions/month",
                  "Nutrition planning",
                  "Priority booking",
                  "2 Guest passes/month",
                  "Exclusive events",
                ],
                popular: false,
              },
              {
                name: "Pay As You Go",
                price: "₦3,000",
                period: "/visit",
                features: [
                  "Single visit access",
                  "1 group class included",
                  "No commitment",
                  "Perfect for travelers",
                ],
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                  plan.popular
                    ? "border-primary-500 bg-white shadow-xl shadow-primary-100 scale-[1.02]"
                    : "border-gray-100 bg-white hover:shadow-lg hover:border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-3 text-center text-sm font-bold rounded-xl transition-all ${
                    plan.popular
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 lg:p-16 shadow-2xl shadow-primary-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Ready to transform your fitness journey?
            </h2>
            <p className="mt-4 text-lg text-primary-100 max-w-xl mx-auto">
              Join thousands of members who are already achieving their goals
              with GymBuddy.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center px-8 py-3.5 text-base font-bold text-primary-600 bg-white rounded-2xl hover:bg-primary-50 transition-all shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">GymBuddy</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} GymBuddy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

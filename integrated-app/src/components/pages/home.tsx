import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { DevModeLoginBypass } from "@/components/DevModeLoginBypass";
import { useDevModeStore } from "@/lib/devMode";

import {
  CalendarHeart,
  ChevronRight,
  Clock,
  HeartHandshake,
  Languages,
  Settings,
  User,
  Users2,
} from "lucide-react";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { enabled } = useDevModeStore();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Elegant navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="font-serif font-medium text-2xl text-rose-700"
            >
              LemonHarbor
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-rose-500"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-rose-500"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-rose-600 text-white hover:bg-rose-700 text-sm px-4">
                    Plan Your Wedding
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero section */}
        <section className="py-20 text-center bg-gradient-to-b from-rose-50 to-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-5xl font-serif font-semibold tracking-tight mb-2 text-rose-800">
              Your Perfect Wedding Journey
            </h2>
            <h3 className="text-2xl font-medium text-gray-600 mb-6">
              Plan every detail of your special day with elegance and ease
            </h3>
            <div className="flex justify-center space-x-6 text-xl text-rose-600">
              <Link to="/" className="flex items-center hover:underline">
                See how it works <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="flex items-center hover:underline">
                Start planning <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 relative">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80"
                  alt="Wedding planning dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 right-[10%] bg-white p-4 rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-rose-600">42</div>
                <div className="text-sm text-gray-500">
                  Days until your wedding
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dev Mode Login Bypass */}
        {enabled && (
          <section className="py-10 bg-blue-50">
            <div className="max-w-[1200px] mx-auto px-4 flex justify-center">
              <DevModeLoginBypass />
            </div>
          </section>
        )}

        {/* Features section */}
        <section className="py-20 bg-[#f9f5f6] text-center">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-4xl font-serif font-semibold tracking-tight mb-2 text-rose-800">
              Everything You Need
            </h2>
            <h3 className="text-xl font-medium text-gray-600 mb-8">
              Comprehensive tools to make your wedding planning stress-free
            </h3>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <Users2 className="h-6 w-6 text-rose-600" />
                </div>
                <h4 className="text-xl font-medium mb-2">Guest Management</h4>
                <p className="text-gray-500">
                  Easily manage your guest list, track RSVPs, and handle dietary
                  restrictions.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CalendarHeart className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-medium mb-2">Table Planning</h4>
                <p className="text-gray-500">
                  Interactive table planner with drag-and-drop functionality and
                  AI-assisted seating.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <HeartHandshake className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-xl font-medium mb-2">Budget Tracking</h4>
                <p className="text-gray-500">
                  Smart budget tools with visual breakdowns of planned vs.
                  actual expenses.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Languages className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-xl font-medium mb-2">Multi-language</h4>
                <p className="text-gray-500">
                  Support for German, English, French, and Spanish with easy
                  language switching.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-serif font-semibold tracking-tight mb-4 text-rose-800">
                  Your Wedding Dashboard
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Keep track of everything in one central location with our
                  elegant, user-friendly dashboard.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Clock className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-1">
                        Wedding Countdown
                      </h4>
                      <p className="text-gray-500">
                        See exactly how many days, hours, and minutes until your
                        special day.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Users2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-1">
                        RSVP Statistics
                      </h4>
                      <p className="text-gray-500">
                        Real-time updates on guest responses and attendance
                        numbers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <CalendarHeart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-1">
                        Upcoming Tasks
                      </h4>
                      <p className="text-gray-500">
                        Never miss a deadline with our smart task management
                        system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link to="/signup">
                    <Button className="rounded-full bg-rose-600 text-white hover:bg-rose-700 px-6 py-2">
                      Create Your Dashboard
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
                    alt="Wedding dashboard"
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm font-medium">
                      12 Tasks Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-[#f9f5f6]">
          <div className="max-w-[1200px] mx-auto px-4 text-center">
            <h2 className="text-4xl font-serif font-semibold tracking-tight mb-2 text-rose-800">
              Happy Couples
            </h2>
            <h3 className="text-xl font-medium text-gray-600 mb-12">
              See what others are saying about their wedding planning experience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80" />
                    <AvatarFallback>SR</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">Sarah & Robert</h4>
                    <p className="text-sm text-gray-500">Berlin, Germany</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The table planning feature saved us so much time and stress.
                  We could easily arrange our guests and the AI suggestions were
                  surprisingly helpful!"
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" />
                    <AvatarFallback>JM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">Julia & Michael</h4>
                    <p className="text-sm text-gray-500">Vienna, Austria</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Being able to track our budget in real-time helped us stay on
                  track. The visual breakdowns made it easy to see where we
                  could save or splurge."
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" />
                    <AvatarFallback>LT</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">Luisa & Thomas</h4>
                    <p className="text-sm text-gray-500">Munich, Germany</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The multi-language support was perfect for our international
                  wedding. Our guests from different countries could all use the
                  RSVP system without any confusion."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] py-12 text-xs text-gray-500">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="border-b border-gray-300 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                LemonHarbor
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Wedding Planning
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Guest Management
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Table Planning
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Budget Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Task Management
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Wedding Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    GDPR Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4">
            <p>
              Copyright © 2025 LemonHarbor Wedding Planning. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

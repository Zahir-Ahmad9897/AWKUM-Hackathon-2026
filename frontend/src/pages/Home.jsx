import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, Zap, Users, ArrowRight, TrendingUp } from "lucide-react";
import { statsAPI } from "../api/client";

const features = [
  {
    icon: Shield,
    title: "NGO Verified",
    desc: "Every campaign is verified by registered NGOs before going live.",
    color: "from-primary-500 to-primary-600",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    desc: "Watch donations flow in live with instant progress updates.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Full Transparency",
    desc: "Track every rupee — from donation to withdrawal to expense.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Community Powered",
    desc: "Built by people who care, for the people who need it most.",
    color: "from-rose-500 to-pink-500",
  },
];

// Format PKR amounts compactly
const formatPKR = (n) => {
  if (!n) return "PKR 0";
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(0)}K+`;
  return `PKR ${n}`;
};

export default function Home() {
  const [liveStats, setLiveStats] = useState([
    { value: "—", label: "Funds Raised" },
    { value: "—", label: "Campaigns" },
    { value: "—", label: "Donors" },
    { value: "—", label: "Members" },
  ]);

  // Fetch real stats from the backend
  useEffect(() => {
    statsAPI.getPublic()
      .then((res) => {
        const s = res.data.data;
        setLiveStats([
          { value: formatPKR(s.totalDonationAmount), label: "Funds Raised" },
          { value: `${s.totalCampaigns}+`,           label: "Campaigns" },
          { value: `${s.totalDonations}+`,           label: "Donors" },
          { value: `${s.totalUsers}+`,               label: "Members" },
        ]);
      })
      .catch(() => {
        // API unreachable — leave placeholders rather than crash
      });
  }, []);

  return (
    <div className="bg-transparent">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

            {/* Hero Text */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-8 border border-primary-100">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Verified Crowdfunding for Social Impact
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-dark-900 mb-6">
                Fund the Change
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">
                  You Believe In
                </span>
              </h1>

              <p className="text-lg text-dark-500 mb-10 sm:max-w-xl sm:mx-auto lg:mx-0">
                TrustFund connects generous donors with NGO-verified social impact campaigns.
                Every donation is tracked. Every rupee is transparent.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/campaigns"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 shadow-xl shadow-primary-600/20 text-white rounded-xl font-bold text-lg hover:-translate-y-1 transition-transform flex items-center justify-center gap-2"
                >
                  Explore Campaigns
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-dark-200 text-dark-700 rounded-xl font-bold text-lg hover:border-primary-300 hover:bg-dark-50 transition-colors text-center"
                >
                  Start a Campaign
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden animate-fade-in border-4 border-white">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                  alt="People gathered helping each other"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Stats Bar — REAL data from API ─── */}
      <div className="bg-primary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {liveStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-primary-100 font-medium mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Features Section ─── */}
      <section className="py-20 px-4 bg-dark-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-dark-900 mb-4">
              Why Choose TrustFund?
            </h2>
            <p className="text-dark-500 text-lg max-w-2xl mx-auto">
              We built TrustFund to solve the trust crisis in crowdfunding. Don't worry about scams; we vet everything.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl p-8 border border-dark-100 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 mb-3">{f.title}</h3>
                <p className="text-dark-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section with Image ─── */}
      <section className="py-20 px-4 mb-10">
        <div className="max-w-6xl mx-auto bg-dark-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1532629345422-7515f3d16b0a?q=80&w=2070&auto=format&fit=crop"
              alt="Hands holding a plant"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/90 to-transparent" />
          </div>

          <div className="relative p-12 md:p-20 lg:w-2/3">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Ready to Make a Real Difference?
            </h2>
            <p className="text-dark-300 text-lg mb-10 max-w-xl">
              Join thousands of donors and changemakers on TrustFund today. Your contribution holds the power to change lives, with zero doubts about its destination.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-xl font-bold text-lg hover:bg-primary-600 hover:shadow-xl transition-all group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

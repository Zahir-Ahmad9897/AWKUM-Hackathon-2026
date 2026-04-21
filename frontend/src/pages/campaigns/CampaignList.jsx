// ─── Campaigns List Page ───

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { campaignsAPI } from "../../api/client";
import { Search, Calendar, Users, TrendingUp, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function StatusBadge({ status }) {
  const styles = {
    VERIFIED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-200",
    COMPLETED: "bg-primary-50 text-primary-600 border-primary-200",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${styles[status] || "bg-dark-100 text-dark-500"}`}>
      {status}
    </span>
  );
}

function ProgressBar({ current, goal }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function CampaignList() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCampaigns();
  }, [page, search]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };
      if (search) params.search = search;
      const res = await campaignsAPI.getAll(params);
      setCampaigns(res.data.data.campaigns);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Campaigns</h1>
          <p className="text-dark-500 mt-1">Discover verified campaigns making real impact</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search campaigns..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          {user && (
            <Link
              to="/campaigns/create"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Create
            </Link>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <p className="text-lg">No campaigns found.</p>
        </div>
      ) : (
        <>
          {/* Campaign Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c, i) => (
              <Link
                key={c.id}
                to={`/campaigns/${c.id}`}
                className="group bg-white rounded-2xl border border-dark-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Gradient header */}
                <div className="h-3 bg-gradient-to-r from-primary-500 via-primary-400 to-emerald-500" />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-dark-900 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
                      {c.title}
                    </h3>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="text-dark-500 text-sm line-clamp-2 mb-4">{c.description}</p>

                  {/* Progress */}
                  <div className="mb-3">
                    <ProgressBar current={c.currentAmount} goal={c.goalAmount} />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="font-semibold text-primary-600">{formatAmount(c.currentAmount)}</span>
                      <span className="text-dark-400">of {formatAmount(c.goalAmount)}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-dark-400 pt-3 border-t border-dark-100">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {c._count?.donations || 0} donors
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(c.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {Math.round((c.currentAmount / c.goalAmount) * 100)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-medium transition-all ${
                    page === i + 1
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                      : "bg-white text-dark-600 border border-dark-200 hover:border-primary-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Admin Dashboard ───

import { useState, useEffect } from "react";
import { adminAPI, reportsAPI } from "../../api/client";
import { Users, TrendingUp, Heart, FileText, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, ngoRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingNGOs(),
        reportsAPI.list({ status: "PENDING" }),
      ]);
      setStats(statsRes.data.data);
      setPendingNGOs(ngoRes.data.data);
      setReports(reportsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNGOReview = async (id, status) => {
    try {
      if (status === "REJECTED" && !rejectReason.trim()) {
        return toast.error("Please provide a rejection reason.");
      }
      await adminAPI.reviewNGO(id, {
        status,
        rejectionReason: status === "REJECTED" ? rejectReason : undefined,
      });
      toast.success(status === "APPROVED" ? "NGO approved! ✅" : "NGO rejected.");
      setPendingNGOs((prev) => prev.filter((n) => n.id !== id));
      setRejectId(null);
      setRejectReason("");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Review failed");
    }
  };

  const handleResolveReport = async (id, status) => {
    try {
      await reportsAPI.resolve(id, { status });
      toast.success("Report " + status.toLowerCase());
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error("Failed to resolve report");
    }
  };

  const formatAmount = (a) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(a || 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "from-primary-500 to-primary-600" },
    { icon: FileText, label: "Campaigns", value: stats?.totalCampaigns || 0, color: "from-emerald-500 to-teal-500" },
    { icon: Heart, label: "Donations", value: stats?.totalDonations || 0, color: "from-rose-500 to-pink-500" },
    { icon: TrendingUp, label: "Total Raised", value: formatAmount(stats?.totalDonationAmount), color: "from-amber-500 to-orange-500" },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ngo", label: `NGO Applications (${pendingNGOs.length})` },
    { id: "reports", label: `Reports (${reports.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary-600" /> Admin Dashboard
        </h1>
        <p className="text-dark-500 mt-1">Manage the platform, review applications, and resolve reports</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-dark-100 p-5 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-dark-900">{s.value}</p>
            <p className="text-dark-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Alerts */}
      {stats?.pending && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {Object.entries(stats.pending).map(([key, val]) => (
            val > 0 && (
              <div key={key} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-800 text-sm font-medium">{val} pending {key}</span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-dark-900 shadow-sm" : "text-dark-500 hover:text-dark-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="bg-white rounded-2xl border border-dark-100 p-8 text-center text-dark-400">
          <Shield className="w-12 h-12 mx-auto mb-3 text-primary-300" />
          <p className="text-lg font-medium text-dark-600">Platform is running smoothly</p>
          <p className="text-sm mt-1">Check the NGO Applications and Reports tabs for pending actions.</p>
        </div>
      )}

      {tab === "ngo" && (
        <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
          {pendingNGOs.length === 0 ? (
            <div className="text-center py-12 text-dark-400">No pending NGO applications.</div>
          ) : (
            <div className="divide-y divide-dark-100">
              {pendingNGOs.map((n) => (
                <div key={n.id} className="p-6 hover:bg-dark-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-dark-900">{n.organizationName}</h3>
                      <p className="text-dark-500 text-sm">Reg: {n.registrationNumber}</p>
                      <p className="text-dark-400 text-sm">Applicant: {n.user.name} ({n.user.email})</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNGOReview(n.id, "APPROVED")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      {rejectId === n.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason..."
                            className="px-3 py-2 border border-dark-200 rounded-xl text-sm w-40"
                          />
                          <button
                            onClick={() => handleNGOReview(n.id, "REJECTED")}
                            className="px-3 py-2 bg-rose-500 text-white rounded-xl text-sm"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRejectId(n.id)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-rose-300 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-dark-400">No pending reports.</div>
          ) : (
            <div className="divide-y divide-dark-100">
              {reports.map((r) => (
                <div key={r.id} className="p-6 hover:bg-dark-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-dark-400">Report #{r.id} • {r.targetType} #{r.targetId}</p>
                      <p className="text-dark-800 mt-1">{r.reason}</p>
                      <p className="text-dark-400 text-xs mt-1">By: {r.reporter.name} • {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(r.id, "RESOLVED")}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, "DISMISSED")}
                        className="px-3 py-2 border border-dark-200 text-dark-600 rounded-xl text-sm hover:bg-dark-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

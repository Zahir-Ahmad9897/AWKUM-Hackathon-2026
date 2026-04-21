// ─── NGO Dashboard ───

import { useState, useEffect } from "react";
import { ngoAPI } from "../../api/client";
import { CheckCircle, XCircle, Clock, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function NGODashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => { loadPending(); }, []);

  const loadPending = async () => {
    try {
      const res = await ngoAPI.getPendingCampaigns();
      setCampaigns(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await ngoAPI.verifyCampaign(id, { status: "VERIFIED" });
      toast.success("Campaign verified! ✅");
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error("Please provide a reason.");
    try {
      await ngoAPI.verifyCampaign(actionId, { status: "REJECTED", rejectionReason: rejectReason });
      toast.success("Campaign rejected.");
      setCampaigns((prev) => prev.filter((c) => c.id !== actionId));
      setShowRejectModal(false);
      setRejectReason("");
      setActionId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    }
  };

  const formatAmount = (a) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(a);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900">NGO Dashboard</h1>
        <p className="text-dark-500 mt-1">Review and verify pending campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-700">{campaigns.length}</p>
          <p className="text-amber-600 text-sm">Pending Review</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-700">—</p>
          <p className="text-emerald-600 text-sm">Approved</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
          <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-rose-700">—</p>
          <p className="text-rose-600 text-sm">Rejected</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-lg font-bold text-dark-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" /> Pending Campaigns
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <p>🎉 No pending campaigns to review!</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100">
            {campaigns.map((c) => (
              <div key={c.id} className="p-6 hover:bg-dark-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark-900">{c.title}</h3>
                    <p className="text-dark-500 text-sm mt-1 line-clamp-2">{c.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-dark-400">
                      <span>Goal: <strong className="text-dark-700">{formatAmount(c.goalAmount)}</strong></span>
                      <span>By: <strong className="text-dark-700">{c.user.name}</strong></span>
                      <span>Deadline: {new Date(c.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(c.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => { setActionId(c.id); setShowRejectModal(true); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-300 text-rose-600 rounded-xl font-medium hover:bg-rose-50 transition-all text-sm"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" /> Rejection Reason
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none mb-4"
              placeholder="Explain why this campaign is being rejected..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-dark-500 hover:text-dark-700">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

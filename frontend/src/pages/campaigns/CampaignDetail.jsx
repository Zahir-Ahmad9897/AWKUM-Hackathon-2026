// ─── Campaign Detail Page ───

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { campaignsAPI, donationsAPI } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { Heart, ArrowLeft, Calendar, User, AlertCircle, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onNewDonation = useCallback((data) => {
    if (data.campaignId === parseInt(id)) {
      setCampaign((prev) => prev ? { ...prev, currentAmount: data.currentAmount } : prev);
      toast.success(`${data.donorName} donated PKR ${data.amount.toLocaleString()}!`, { icon: "🎉" });
    }
  }, [id]);

  const { joinCampaign, leaveCampaign } = useSocket(onNewDonation);

  useEffect(() => {
    fetchCampaign();
    joinCampaign(id);
    return () => leaveCampaign(id);
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await campaignsAPI.getOne(id);
      setCampaign(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDonate = async (data) => {
    try {
      setDonating(true);
      const res = await donationsAPI.donate({
        campaignId: parseInt(id),
        amount: parseFloat(data.amount),
        message: data.message || undefined,
        isAnonymous: data.isAnonymous || false,
      });
      setReceipt(res.data.data.receipt);
      toast.success("Donation successful! 🎉");
      reset();
      fetchCampaign();
    } catch (err) {
      toast.error(err.response?.data?.message || "Donation failed");
    } finally {
      setDonating(false);
    }
  };

  const formatAmount = (a) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(a);
  const pct = campaign ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100) : 0;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!campaign) return (
    <div className="text-center py-20">
      <p className="text-dark-500 text-lg">Campaign not found.</p>
      <Link to="/campaigns" className="text-primary-600 hover:underline mt-2 inline-block">Back to campaigns</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-dark-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-primary-500 to-emerald-500" />
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-dark-900">{campaign.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                  campaign.status === "VERIFIED" ? "bg-emerald-50 text-emerald-600" :
                  campaign.status === "COMPLETED" ? "bg-primary-50 text-primary-600" :
                  campaign.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                }`}>{campaign.status}</span>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-primary-600 text-lg">{formatAmount(campaign.currentAmount)}</span>
                  <span className="text-dark-400">raised of {formatAmount(campaign.goalAmount)}</span>
                </div>
                <div className="w-full h-3 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-sm text-dark-400 mt-2">{Math.round(pct)}% funded • {campaign._count?.donations || 0} donors</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-dark-500 mb-6 pb-6 border-b border-dark-100">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> by {campaign.user.name}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
              </div>

              <div className="prose prose-dark-800 max-w-none">
                <h3 className="text-lg font-bold mb-2">About this Campaign</h3>
                <p className="text-dark-600 whitespace-pre-wrap leading-relaxed">{campaign.description}</p>
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-2xl border border-dark-100 p-6">
            <h3 className="text-lg font-bold text-dark-900 mb-4">Recent Donations</h3>
            {campaign.donations?.length === 0 ? (
              <p className="text-dark-400 text-sm">No donations yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {campaign.donations?.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {d.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-800">{d.user.name}</p>
                        {d.message && <p className="text-xs text-dark-400">{d.message}</p>}
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600 text-sm">{formatAmount(d.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — Donate Form */}
        <div className="space-y-6">
          {campaign.status === "VERIFIED" && user && (
            <div className="bg-white rounded-2xl border border-dark-100 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Make a Donation
              </h3>

              <form onSubmit={handleSubmit(onDonate)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    {...register("amount", { required: "Amount required", min: { value: 100, message: "Minimum PKR 100" } })}
                    className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="500"
                  />
                  {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Message (optional)</label>
                  <textarea
                    {...register("message")}
                    rows={2}
                    className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Keep up the great work!"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register("isAnonymous")} className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-dark-600">Donate anonymously</span>
                </label>

                <button
                  type="submit"
                  disabled={donating}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {donating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Donate Now <Heart className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Receipt */}
              {receipt && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" /> Donation Receipt
                  </div>
                  <div className="text-sm text-emerald-800 space-y-1">
                    <p><strong>TX ID:</strong> {receipt.transactionId}</p>
                    <p><strong>Amount:</strong> {formatAmount(receipt.amount)}</p>
                    <p><strong>Campaign:</strong> {receipt.campaignName}</p>
                    <p><strong>Date:</strong> {new Date(receipt.date).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {campaign.status !== "VERIFIED" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-700 font-medium">
                <Clock className="w-5 h-5" />
                {campaign.status === "PENDING" && "This campaign is awaiting NGO verification."}
                {campaign.status === "COMPLETED" && "This campaign has been fully funded! 🎉"}
                {campaign.status === "REJECTED" && "This campaign was not approved."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

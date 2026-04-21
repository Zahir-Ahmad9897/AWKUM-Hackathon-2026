// ─── User Dashboard ───

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { campaignsAPI, ngoAPI } from "../../api/client";
import { Plus, Eye, Clock, CheckCircle, XCircle, Building2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const statusIcon = {
  PENDING: <Clock className="w-4 h-4 text-amber-500" />,
  VERIFIED: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  REJECTED: <XCircle className="w-4 h-4 text-rose-500" />,
  COMPLETED: <CheckCircle className="w-4 h-4 text-primary-500" />,
};

export default function Dashboard() {
  const { user, fetchUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNGOForm, setShowNGOForm] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await campaignsAPI.getMine();
      setCampaigns(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyNGO = async (data) => {
    try {
      await ngoAPI.apply(data);
      toast.success("NGO application submitted! Awaiting admin review.");
      setShowNGOForm(false);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Application failed.");
    }
  };

  const formatAmount = (a) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(a);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Welcome, {user?.name} 👋</h1>
          <p className="text-dark-500 mt-1">Manage your campaigns and track donations</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/campaigns/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
          {user?.role === "USER" && (
            <button
              onClick={() => setShowNGOForm(!showNGOForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dark-200 text-dark-700 rounded-xl font-medium hover:border-primary-300 transition-all"
            >
              <Building2 className="w-4 h-4" /> Apply as NGO
            </button>
          )}
        </div>
      </div>

      {/* NGO Application Form */}
      {showNGOForm && (
        <div className="bg-white rounded-2xl border border-primary-200 p-6 mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" /> NGO Application
          </h3>
          <form onSubmit={handleSubmit(applyNGO)} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Organization Name</label>
              <input
                {...register("organizationName", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })}
                className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Green Foundation Pakistan"
              />
              {errors.organizationName && <p className="text-rose-500 text-xs mt-1">{errors.organizationName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Registration Number</label>
              <input
                {...register("registrationNumber", { required: "Required" })}
                className="w-full px-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="NGO-2024-00123"
              />
              {errors.registrationNumber && <p className="text-rose-500 text-xs mt-1">{errors.registrationNumber.message}</p>}
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-lg font-bold text-dark-900">My Campaigns</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <p>You haven't created any campaigns yet.</p>
            <Link to="/campaigns/create" className="text-primary-600 hover:underline mt-1 inline-block">Create your first campaign</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-50 text-dark-500 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Raised</th>
                  <th className="px-6 py-3 font-medium">Goal</th>
                  <th className="px-6 py-3 font-medium">Donors</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark-800 max-w-[200px] truncate">{c.title}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        {statusIcon[c.status]}
                        <span className="text-dark-600">{c.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{formatAmount(c.currentAmount)}</td>
                    <td className="px-6 py-4 text-dark-500">{formatAmount(c.goalAmount)}</td>
                    <td className="px-6 py-4 text-dark-500">{c._count?.donations || 0}</td>
                    <td className="px-6 py-4">
                      <Link to={`/campaigns/${c.id}`} className="inline-flex items-center gap-1 text-primary-600 hover:underline text-sm">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

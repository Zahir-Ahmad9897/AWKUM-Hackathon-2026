// ─── Create Campaign Page ───

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { campaignsAPI } from "../../api/client";
import { ArrowLeft, Megaphone, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      setError("");
      await campaignsAPI.create({
        title: data.title,
        description: data.description,
        goalAmount: parseFloat(data.goalAmount),
        deadline: data.deadline,
      });
      toast.success("Campaign created! It will be reviewed by an NGO.");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create campaign.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-dark-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary-500 to-emerald-500" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-900">Create Campaign</h1>
              <p className="text-dark-500 text-sm">Your campaign will be sent for NGO verification</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Campaign Title</label>
              <input
                type="text"
                {...register("title", { required: "Title is required", minLength: { value: 5, message: "Min 5 characters" } })}
                className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Clean Water for Thar Village"
              />
              {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Description</label>
              <textarea
                {...register("description", { required: "Description is required", minLength: { value: 20, message: "Min 20 characters" } })}
                rows={5}
                className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Describe your campaign, its goal, and the people it will help..."
              />
              {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Goal Amount (PKR)</label>
                <input
                  type="number"
                  {...register("goalAmount", { required: "Required", min: { value: 1000, message: "Min PKR 1,000" } })}
                  className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="500000"
                />
                {errors.goalAmount && <p className="text-rose-500 text-xs mt-1">{errors.goalAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Deadline</label>
                <input
                  type="date"
                  {...register("deadline", { required: "Required" })}
                  className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.deadline && <p className="text-rose-500 text-xs mt-1">{errors.deadline.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Submit for Verification"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

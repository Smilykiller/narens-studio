"use client";

import { useState } from "react";
import { User, Phone, MapPin, Check, X, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from "@/app/actions/profile";

export default function ProfileEditor({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      alert(result.error);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingPassword(true);
    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);
    setIsSavingPassword(false);
    if (result.success) {
      alert(result.message);
      setIsChangingPassword(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="space-y-12">
      {/* PROFILE SECTION */}
      {isEditing ? (
        <form onSubmit={handleProfileSubmit} className="flex flex-col md:flex-row gap-8 items-start w-full">
          <div className="flex-1 space-y-4 w-full">
            <h3 className="text-xl font-serif text-sand-text mb-4">Edit Profile</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Full Name</label>
                <input name="full_name" defaultValue={user.full_name || ""} className="w-full bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sand-text mt-1 focus:border-white/30 outline-none" required />
              </div>
              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Phone</label>
                <input name="phone" defaultValue={user.phone || ""} className="w-full bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sand-text mt-1 focus:border-white/30 outline-none" />
              </div>
              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Address</label>
                <input name="address" defaultValue={user.address || ""} className="w-full bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sand-text mt-1 focus:border-white/30 outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">City</label>
                  <input name="city" defaultValue={user.city || ""} className="w-full bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sand-text mt-1 focus:border-white/30 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Pincode</label>
                  <input name="pincode" defaultValue={user.pincode || ""} className="w-full bg-sand-surface border border-sand-border rounded-lg px-3 py-2 text-sand-text mt-1 focus:border-white/30 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 text-sm bg-sand-surface text-sand-text px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="flex items-center justify-center gap-2 text-sm border border-sand-border px-6 py-3 rounded-xl text-sand-muted hover:text-sand-text hover:border-white transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-start w-full">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-serif text-sand-text mb-2">Profile Details</h3>
            <div className="flex items-center gap-3 text-sand-muted">
              <User className="w-4 h-4" /> {user.full_name || "Name not provided"}
            </div>
            <div className="flex items-center gap-3 text-sand-muted">
              <Phone className="w-4 h-4" /> {user.phone || "Phone not provided"}
            </div>
            <div className="flex items-start gap-3 text-sand-muted">
              <MapPin className="w-4 h-4 mt-1" /> 
              <span>{user.address ? `${user.address}, ${user.city || ''} ${user.pincode || ''}` : "Address not provided"}</span>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="text-sm border border-sand-border px-4 py-2 rounded-lg text-sand-muted hover:text-sand-text hover:border-white transition-colors">
            Edit Profile
          </button>
        </div>
      )}

      <hr className="border-sand-border" />

      {/* PASSWORD SECTION */}
      {isChangingPassword ? (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col md:flex-row gap-8 items-start w-full">
          <div className="flex-1 space-y-4 w-full">
            <h3 className="text-xl font-serif text-sand-text mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sand-muted" /> Change Password
            </h3>
            
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Current Password</label>
                <div className="relative mt-1">
                  <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" required className="w-full bg-sand-surface border border-sand-border rounded-lg pl-3 pr-10 py-2 text-sand-text focus:border-white/30 outline-none" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-muted hover:text-sand-text transition-colors">
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">New Password</label>
                <div className="relative mt-1">
                  <input type={showNewPassword ? "text" : "password"} name="newPassword" required className="w-full bg-sand-surface border border-sand-border rounded-lg pl-3 pr-10 py-2 text-sand-text focus:border-white/30 outline-none" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-muted hover:text-sand-text transition-colors">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-sand-muted uppercase tracking-widest font-bold">Confirm New Password</label>
                <div className="relative mt-1">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required className="w-full bg-sand-surface border border-sand-border rounded-lg pl-3 pr-10 py-2 text-sand-text focus:border-white/30 outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-muted hover:text-sand-text transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <button type="submit" disabled={isSavingPassword} className="flex items-center justify-center gap-2 text-sm bg-sand-surface text-sand-text px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Update Password
            </button>
            <button type="button" onClick={() => setIsChangingPassword(false)} className="flex items-center justify-center gap-2 text-sm border border-sand-border px-6 py-3 rounded-xl text-sand-muted hover:text-sand-text hover:border-white transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-start w-full">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-serif text-sand-text mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sand-muted" /> Security
            </h3>
            <div className="text-sand-muted text-sm">
              Keep your account secure by updating your password regularly.
            </div>
          </div>
          <button onClick={() => setIsChangingPassword(true)} className="text-sm border border-sand-border px-4 py-2 rounded-lg text-sand-muted hover:text-sand-text hover:border-white transition-colors">
            Change Password
          </button>
        </div>
      )}
    </div>
  );
}


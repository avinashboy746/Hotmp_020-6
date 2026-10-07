import React, { useState } from 'react';
import { X, Plus, Check, User, Trash2, Edit2, PlayCircle } from 'lucide-react';
import { Profile } from '../types';

interface ProfileModalProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (data: { name: string; avatar: string; isKids: boolean; autoPlay?: boolean }) => Promise<void>;
  onUpdateProfile: (id: string, data: Partial<Profile>) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isKids, setIsKids] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCreate = () => {
    setName('');
    setSelectedAvatar(AVATAR_OPTIONS[0]);
    setIsKids(false);
    setAutoPlay(true);
    setIsCreating(true);
    setEditingProfileId(null);
    setError(null);
  };

  const startEdit = (p: Profile) => {
    setEditingProfileId(p.id);
    setName(p.name);
    setSelectedAvatar(p.avatar);
    setIsKids(p.isKids);
    setAutoPlay(p.autoPlay !== false);
    setIsCreating(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Profile name cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isCreating) {
        await onCreateProfile({ name: name.trim(), avatar: selectedAvatar, isKids, autoPlay });
        setIsCreating(false);
      } else if (editingProfileId) {
        await onUpdateProfile(editingProfileId, { name: name.trim(), avatar: selectedAvatar, isKids, autoPlay });
        setEditingProfileId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (profiles.length <= 1) {
      setError('Cannot delete the only profile');
      return;
    }
    if (confirm('Are you sure you want to delete this profile? All its watch history will be removed.')) {
      setLoading(true);
      try {
        await onDeleteProfile(id);
      } catch (err: any) {
        setError(err.message || 'Failed to delete profile');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-['Outfit',sans-serif]">
                {isCreating ? 'Create Profile' : editingProfileId ? 'Edit Profile' : "Who's Watching?"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isCreating || editingProfileId ? 'Customize your avatar and playback preferences' : 'Select or manage user profiles'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Profile List Mode */}
        {!isCreating && !editingProfileId && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profiles.map((p) => {
                const isActive = activeProfile?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className="relative group flex flex-col items-center p-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all text-center"
                  >
                    <div
                      onClick={() => {
                        onSelectProfile(p);
                        onClose();
                      }}
                      className="cursor-pointer flex flex-col items-center w-full"
                    >
                      <div className="relative mb-2">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className={`w-16 h-16 rounded-full object-cover transition-transform group-hover:scale-105 ${
                            isActive ? 'ring-4 ring-rose-500' : 'ring-1 ring-zinc-700'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        {isActive && (
                          <div className="absolute -bottom-1 -right-1 p-1 bg-rose-600 rounded-full text-white shadow-md">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-full">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
                        {p.isKids && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                            Kids
                          </span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${p.autoPlay !== false ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700/60 text-zinc-400'}`}>
                          {p.autoPlay !== false ? 'Auto-Play' : 'Manual'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Edit/Delete buttons */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-zinc-700/50 w-full justify-center">
                      <button
                        onClick={() => startEdit(p)}
                        className="p-1 rounded-lg bg-zinc-700/60 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Profile Settings"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded-lg bg-zinc-700/60 hover:bg-rose-900/60 text-zinc-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Profile Card */}
              <button
                id="add-profile-card-btn"
                onClick={startCreate}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-800/20 hover:bg-zinc-800/60 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white transition-all cursor-pointer min-h-[140px]"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Add Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* Create / Edit Profile Form Mode */}
        {(isCreating || editingProfileId) && (
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Profile Name</label>
              <input
                id="profile-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Otaku Master"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400">Choose Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative rounded-xl overflow-hidden aspect-square p-0.5 border-2 transition-all cursor-pointer ${
                      selectedAvatar === av ? 'border-rose-500 scale-105' : 'border-transparent hover:border-zinc-700'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Preferences Section */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Playback & Content Preferences
              </label>

              {/* Auto-Play Next Episode Preference Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-start gap-3 pr-3">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${autoPlay ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white block">Auto-Play Next Episode</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${autoPlay ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'}`}>
                        {autoPlay ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 leading-relaxed block mt-0.5">
                      Automatically load and start the next episode in the video player when the current episode ends.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id="profile-autoplay-toggle"
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Kids Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div>
                  <span className="text-xs font-bold text-white block">Kids Experience?</span>
                  <span className="text-[11px] text-zinc-400">Tailored UI with family-safe anime titles</span>
                </div>
                <input
                  id="profile-kids-toggle"
                  type="checkbox"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProfileId(null);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="button"
                disabled={loading}
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving...' : isCreating ? 'Create Profile' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  Bookmark, 
  Clock, 
  Compass, 
  ShieldCheck, 
  ChevronDown, 
  Plus, 
  User, 
  Sparkles,
  Tv
} from 'lucide-react';
import { Profile } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'browse' | 'continue' | 'mylist' | 'search';
  setCurrentTab: (tab: 'home' | 'browse' | 'continue' | 'mylist' | 'search') => void;
  activeProfile: Profile | null;
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onOpenProfileManager: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeProfile,
  profiles,
  onSelectProfile,
  onOpenProfileManager,
  onOpenAdmin,
  isAdminLoggedIn,
  searchQuery,
  setSearchQuery,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0c10]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <button 
            id="brand-logo-btn"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform duration-200">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black tracking-wider text-white font-['Outfit',sans-serif] leading-none">
                HOT<span className="text-rose-500">MP</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                Anime OTT
              </span>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <button
              id="nav-home-btn"
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-white bg-white/10 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              id="nav-browse-btn"
              onClick={() => setCurrentTab('browse')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'browse'
                  ? 'text-white bg-white/10 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse
            </button>
            <button
              id="nav-continue-btn"
              onClick={() => setCurrentTab('continue')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'continue'
                  ? 'text-white bg-white/10 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" />
              Continue Watching
            </button>
            <button
              id="nav-mylist-btn"
              onClick={() => setCurrentTab('mylist')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'mylist'
                  ? 'text-white bg-white/10 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              My List
            </button>
          </nav>
        </div>

        {/* Right: Search, Admin, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search Box */}
          <div className="relative flex items-center">
            <div className={`flex items-center rounded-xl bg-zinc-900/80 border transition-all duration-200 ${
              searchFocused ? 'border-rose-500 shadow-md shadow-rose-500/10 w-48 sm:w-64' : 'border-zinc-800 w-36 sm:w-52'
            }`}>
              <Search className="w-4 h-4 ml-3 text-zinc-400 shrink-0" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                placeholder="Search anime..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'search') setCurrentTab('search');
                }}
                onFocus={() => {
                  setSearchFocused(true);
                  if (currentTab !== 'search') setCurrentTab('search');
                }}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Admin Panel Trigger */}
          <button
            id="admin-panel-btn"
            onClick={onOpenAdmin}
            title="Admin Control Panel"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isAdminLoggedIn 
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              id="profile-dropdown-toggle-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
            >
              {activeProfile?.avatar ? (
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center text-xs font-bold">
                  {activeProfile?.name?.[0] || 'U'}
                </div>
              )}
              <span className="hidden sm:block text-xs font-medium text-zinc-200 max-w-20 truncate">
                {activeProfile?.name || 'Profile'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 mr-1" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-zinc-800/80 mb-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Profiles</p>
                  <p className="text-xs text-zinc-300 font-medium truncate mt-0.5">
                    Current: <span className="text-rose-400 font-semibold">{activeProfile?.name}</span>
                  </p>
                </div>

                {/* Profile List */}
                <div className="space-y-1">
                  {profiles.map((prof) => (
                    <button
                      key={prof.id}
                      id={`select-profile-${prof.id}`}
                      onClick={() => onSelectProfile(prof)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                        activeProfile?.id === prof.id
                          ? 'bg-rose-500/15 text-rose-300 font-medium'
                          : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-6 h-6 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="flex-1 truncate">{prof.name}</span>
                      {prof.isKids && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 rounded font-semibold">
                          Kids
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-zinc-800/80 mt-2 pt-1.5">
                  <button
                    id="manage-profiles-modal-btn"
                    onClick={onOpenProfileManager}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Manage / Add Profiles</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-zinc-800/50 bg-[#0b0c10]/95 text-xs text-zinc-400">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'home' ? 'text-rose-500 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setCurrentTab('browse')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'browse' ? 'text-rose-500 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Browse</span>
        </button>
        <button
          onClick={() => setCurrentTab('continue')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'continue' ? 'text-rose-500 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Continue</span>
        </button>
        <button
          onClick={() => setCurrentTab('mylist')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            currentTab === 'mylist' ? 'text-rose-500 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>My List</span>
        </button>
      </div>
    </header>
  );
};

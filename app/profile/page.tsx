"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';

import ProfileMenu from '@/components/ProfileMenu';

export default function ProfilePage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || '');
      setAvatarPreview(data.avatar_url || '');
    }

    setEmail(user.email || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Upload failed');
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!username || username.trim() === '') {
      setMessage({ type: 'error', text: 'Username is required' });
      return;
    }

    if (username.length < 3) {
      setMessage({ type: 'error', text: 'Username must be at least 3 characters' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload avatar');
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase(),
          avatar_url: newAvatarUrl,
        })
        .eq('id', user.id)
        .select();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Username already taken. Please choose another one.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username.toLowerCase(),
            avatar_url: newAvatarUrl,
          })
          .select();

        if (insertError) throw insertError;
      }

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);

      await refreshProfile();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setAvatarFile(null);
    setAvatarPreview(avatarUrl);
    setIsEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar
        currentView="profile"
        setCurrentView={() => { }}
        onAddHabit={() => router.push('/?action=add-habit')}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-20 xl:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
              Profile
            </h1>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
            {message && (
              <div className={`mb-8 p-4 rounded-xl ${message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                {message.text}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
              {/* Left Column - Avatar & Actions */}
              <div className="flex flex-col gap-6 w-full md:w-auto md:flex-shrink-0">
                <div className="relative group mx-auto md:mx-0">
                  <div className="w-64 h-64 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt={username || 'User'}
                        width={256}
                        height={256}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <span className="text-white font-medium text-sm">Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {!isEditing && (
                    <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="w-24 h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-600 tracking-wider">
                    LOGO
                  </div>
                  <div className="flex-1 h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors cursor-pointer group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[10px] font-bold tracking-wider uppercase">Vendor Documents</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="flex-1 space-y-8">
                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Username:
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-slate-600 dark:text-slate-400 transition-colors"
                        placeholder="Enter username"
                      />
                    ) : (
                      <div className="text-slate-600 dark:text-slate-400">
                        {username || 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Email:
                    </label>
                    <div className="text-slate-600 dark:text-slate-400">
                      {email}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 uppercase tracking-wide"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wide"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide shadow-lg shadow-indigo-500/30"
                      >
                        {isSaving && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

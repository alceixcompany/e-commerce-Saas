'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginUser, clearError } from '@/lib/slices/authSlice';
import { fetchAuthSettings, fetchGlobalSettings } from '@/lib/slices/contentSlice';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const { authSettings, globalSettings } = useAppSelector((state) => state.content);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isPreview) {
      router.push('/');
    }
  }, [isAuthenticated, router, isPreview]);

  useEffect(() => {
    dispatch(fetchAuthSettings());
    dispatch(fetchGlobalSettings());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const loginSettings = authSettings?.login;
  const layout = loginSettings?.layout || 'split-left';
  const title = loginSettings?.title || 'Welcome Back';
  const quote = loginSettings?.quote || 'Exclusive collections, early access rights, and personal style consultancy await you.';
  const imageUrl = loginSettings?.imageUrl || 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-20 animate-in fade-in duration-700">
      <div className={`w-full max-w-[1200px] flex flex-col shadow-2xl overflow-hidden min-h-[700px] bg-background border border-foreground/10 mx-4 ${
        layout === 'centered' ? 'md:max-w-[600px] items-center' :
        layout === 'split-right' ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}>

        {/* Left/Right Side: Visual/Branding (Hidden if centered) */}
        {layout !== 'centered' && (
          <div className="w-full md:w-1/2 relative overflow-hidden hidden md:block">
            <img
              src={imageUrl}
              alt={`${globalSettings.siteName || 'Ocean Gem'} Jewelry`}
              className="w-full h-full object-cover transition-transform duration-1000 scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200';
              }}
            />
            <div className="absolute inset-0 bg-foreground/30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-background text-center p-12">
              <h2 className="text-5xl font-light serif mb-6 tracking-wide leading-tight uppercase">
                {globalSettings.siteName || 'OCEAN GEM'} <br /> <span className="italic">Privilege</span> Join
              </h2>
              <div className="w-16 h-0.5 bg-primary mb-8"></div>
              <p className="text-sm font-light tracking-[0.1em] max-w-xs leading-relaxed opacity-90">
                {quote}
              </p>
            </div>
            <div className="absolute bottom-10 left-10">
              <h1 className="text-xl font-bold tracking-[0.3em] text-background serif opacity-50 uppercase">{globalSettings.siteName || 'OCEAN GEM'}</h1>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className={`w-full p-10 md:p-20 flex flex-col justify-center bg-foreground/5 ${layout !== 'centered' ? 'md:w-1/2' : 'flex-1 items-center'}`}>
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <span className="text-[10px] tracking-[0.5em] font-bold text-foreground uppercase mb-4 block">Account</span>
              <h3 className="text-3xl font-light serif text-foreground tracking-wide mb-2">
                {title}
              </h3>
              <p className="text-xs text-foreground/50 font-light tracking-wide">
                Enter your details to access the world of {globalSettings.siteName || 'OCEAN GEM'}.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Email Address</label>
                <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group">
                  <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-foreground transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mail@example.com"
                    required
                    className="w-full bg-transparent py-3 pl-8 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Password</label>
                  <Link href="#" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-primary/80">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group">
                  <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-foreground transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent py-3 pl-8 pr-8 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background py-5 font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-foreground/90 transition-all flex items-center justify-center gap-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log In'} <FiArrowRight size={16} />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-foreground/50 font-light tracking-wide">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="ml-2 font-bold text-foreground uppercase tracking-widest hover:text-primary transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginUser, clearError } from '@/lib/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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
    <div className="min-h-screen flex items-center justify-center bg-white pt-20 animate-in fade-in duration-700">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row shadow-2xl overflow-hidden min-h-[700px] bg-white border border-gray-100 mx-4">

        {/* Left Side: Visual/Branding */}
        <div className="w-full md:w-1/2 relative overflow-hidden hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200"
            alt="Ocean Gem Jewelry"
            className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200';
            }}
          />
          <div className="absolute inset-0 bg-cyan-950/30"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-12">
            <h2 className="text-5xl font-light serif mb-6 tracking-wide leading-tight">
              OCEAN GEM <br /> <span className="italic">Privilege</span> Join
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A059] mb-8"></div>
            <p className="text-sm font-light tracking-[0.1em] max-w-xs leading-relaxed opacity-90">
              Exclusive collections, early access rights, and personal style consultancy await you.
            </p>
          </div>
          <div className="absolute bottom-10 left-10">
            <h1 className="text-xl font-bold tracking-[0.3em] text-white serif opacity-50">OCEAN GEM</h1>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-[#FBFBFB]">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-12">
              <span className="text-[10px] tracking-[0.5em] font-bold text-[#164e63] uppercase mb-4 block">Account</span>
              <h3 className="text-3xl font-light serif text-gray-900 tracking-wide mb-2">
                Welcome Back
              </h3>
              <p className="text-xs text-gray-500 font-light tracking-wide">
                Enter your details to access the world of OCEAN GEM.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative border-b border-gray-200 focus-within:border-[#164e63] transition-colors group">
                  <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#164e63] transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mail@example.com"
                    required
                    className="w-full bg-transparent py-3 pl-8 text-sm text-black focus:outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                  <Link href="#" className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059] hover:text-[#A6803F]">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative border-b border-gray-200 focus-within:border-[#164e63] transition-colors group">
                  <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#164e63] transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent py-3 pl-8 pr-8 text-sm text-black focus:outline-none placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#164e63] text-white py-5 font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-[#0e3342] transition-all flex items-center justify-center gap-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log In'} <FiArrowRight size={16} />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-gray-400 font-light tracking-wide">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="ml-2 font-bold text-[#164e63] uppercase tracking-widest hover:text-[#C5A059] transition-colors"
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

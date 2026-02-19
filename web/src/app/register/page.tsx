'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { registerUser, clearError } from '@/lib/slices/authSlice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    await dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-20 animate-in fade-in duration-700">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row shadow-2xl overflow-hidden min-h-[700px] bg-white border border-gray-100 mx-4">

        {/* Left Side: Visual/Branding */}
        <div className="w-full md:w-1/2 relative overflow-hidden hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1603561591411-071c4f723932?auto=format&fit=crop&q=80&w=1200"
            alt="Jewelry Branding"
            className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200';
            }}
          />
          <div className="absolute inset-0 bg-black/30"></div>
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
              <span className="text-[10px] tracking-[0.5em] font-bold text-[#C5A059] uppercase mb-4 block">Account</span>
              <h3 className="text-3xl font-light serif text-gray-900 tracking-wide mb-2">
                Join Us
              </h3>
              <p className="text-xs text-gray-500 font-light tracking-wide">
                Register for the new address of luxury and elegance.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                <div className="relative border-b border-gray-200 focus-within:border-[#C5A059] transition-colors group">
                  <FiUser className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Victoria Sterling"
                    required
                    className="w-full bg-transparent py-3 pl-8 text-sm text-black focus:outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative border-b border-gray-200 focus-within:border-[#C5A059] transition-colors group">
                  <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" size={16} strokeWidth={1.5} />
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                <div className="relative border-b border-gray-200 focus-within:border-[#C5A059] transition-colors group">
                  <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                <div className="relative border-b border-gray-200 focus-within:border-[#C5A059] transition-colors group">
                  <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" size={16} strokeWidth={1.5} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent py-3 pl-8 pr-8 text-sm text-black focus:outline-none placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-[9px] text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || (formData.password !== formData.confirmPassword)}
                className="w-full bg-gray-900 text-white py-5 font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-[#C5A059] transition-all flex items-center justify-center gap-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register'} <FiArrowRight size={16} />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-gray-400 font-light tracking-wide">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="ml-2 font-bold text-gray-900 uppercase tracking-widest hover:text-[#C5A059] transition-colors"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

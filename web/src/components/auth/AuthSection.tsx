'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearError, loginUser, registerUser } from '@/lib/slices/authSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthSectionProps {
    instanceId?: string;
    data?: {
        type: 'login' | 'register';
        title?: string;
        subtitle?: string;
        tagline?: string;
        imageUrl?: string;
        layout?: 'split-left' | 'split-right' | 'centered';
    buttonText?: string;
  };
}

type AuthMode = 'login' | 'register';
type AuthContentField = 'title' | 'subtitle' | 'tagline' | 'imageUrl' | 'layout' | 'buttonText';
type AuthContentSource = Partial<Record<AuthContentField, string>>;

const DEFAULT_AUTH_CONFIG = {
  login: {
    title: '',
    subtitle: '',
    tagline: '',
    imageUrl: '/image/alceix/hero.png',
    layout: 'split-left' as const,
    buttonText: ''
  },
  register: {
    title: '',
    subtitle: '',
    tagline: '',
    imageUrl: '/image/alceix/hero.png',
    layout: 'split-left' as const,
    buttonText: ''
  }
};

export default function AuthSection({ instanceId, data: directData }: AuthSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const requestedReturnUrl = searchParams.get('returnUrl');
  const safeReturnUrl = requestedReturnUrl && requestedReturnUrl.startsWith('/') && !requestedReturnUrl.startsWith('//') && !requestedReturnUrl.startsWith('/login') && !requestedReturnUrl.startsWith('/register')
    ? requestedReturnUrl
    : null;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const { instances } = useAppSelector((state) => state.component);
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { globalSettings, authSettings } = useAppSelector((state) => state.content);

  const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
  const instanceType: AuthMode | undefined = instance?.type === 'login' || instance?.type === 'register' ? instance.type : undefined;
  
  // 1. Determine the type (login/register)
  const determinedType: AuthMode = directData?.type || instanceType || (typeof window !== 'undefined' && window.location.pathname.includes('register') ? 'register' : 'login');
  const isLogin = determinedType === 'login';
  const isLoading = isLogin ? loading.login : loading.register;
  
  // 2. Resolve the config: Priority is Instance > DirectData > Database Settings > Hardcoded Defaults
  const hardcodedDefault = DEFAULT_AUTH_CONFIG[determinedType];
  const dbData = authSettings?.[determinedType] as AuthContentSource | undefined;

  // Deep merge strategy: ensure strings aren't empty
  const resolveValue = (key: AuthContentField, ...sources: Array<AuthContentSource | undefined>) => {
    for (const source of sources) {
      const value = source?.[key];
      if (typeof value === 'string' && value !== '') return value;
    }
    return hardcodedDefault[key];
  };

  const finalData = directData || instance?.data || {
    type: determinedType,
    title: resolveValue('title', directData, dbData),
    subtitle: resolveValue('subtitle', directData, dbData),
    tagline: resolveValue('tagline', directData, dbData),
    imageUrl: resolveValue('imageUrl', directData, dbData),
    layout: resolveValue('layout', directData, dbData),
    buttonText: resolveValue('buttonText', directData, dbData),
  };

  const currentConfigKey = isLogin ? 'auth.login' : 'auth.register';

  const data = finalData; 
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !isPreview) {
            if (safeReturnUrl) {
                router.push(safeReturnUrl);
                return;
            }

            if (user?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        }
    }, [isAuthenticated, user, router, isPreview, safeReturnUrl]);

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
        if (isLogin) {
            await dispatch(loginUser({ email: formData.email, password: formData.password }));
        } else {
            await dispatch(registerUser(formData));
        }
    };

    const layout = data.layout || 'split-left';

    return (
        <section className="min-h-[80vh] flex items-center justify-center bg-background py-12 md:py-24 px-4 overflow-hidden relative">
            <div className={`w-full max-w-[1200px] flex flex-col shadow-2xl rounded-[2.5rem] overflow-hidden min-h-[700px] bg-background border border-foreground/5 relative z-10 transition-all duration-700 ${
                layout === 'centered' ? 'md:max-w-[600px] items-center' :
                layout === 'split-right' ? 'md:flex-row-reverse' : 'md:flex-row'
            }`}>

                {/* Visual Side */}
                {layout !== 'centered' && (
                    <div className="w-full md:w-1/2 relative overflow-hidden hidden md:block group">
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5 }}
                            src={data.imageUrl || '/image/alceix/hero.png'}
                            alt="Auth Visual"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
                        <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
                             <div className="w-12 h-[1px] bg-white/40 mb-6"></div>
                             <h4 className="text-3xl font-light serif italic tracking-wide">{globalSettings.siteName || 'ALCEIX'}</h4>
                             <p className="text-sm font-light opacity-80 max-w-xs">{t(`${currentConfigKey}.promo`)}</p>
                        </div>
                    </div>
                )}

                {/* Form Content */}
                <div className={`w-full p-8 md:p-20 flex flex-col justify-center bg-foreground/[0.02] backdrop-blur-sm ${layout !== 'centered' ? 'md:w-1/2' : 'flex-1 items-center'}`}>
                    <div className="max-w-md mx-auto w-full space-y-12">
                        <div>
                            <span className="text-[10px] tracking-[0.5em] font-bold text-primary uppercase mb-4 block">{data.tagline || t(`${currentConfigKey}.tagline`)}</span>
                            <h3 className="text-4xl font-light serif text-foreground tracking-wide mb-4">
                                {data.title || t(`${currentConfigKey}.title`)}
                            </h3>
                            <p className="text-sm text-foreground/40 font-light tracking-wide leading-relaxed">
                                {data.subtitle || t(`${currentConfigKey}.subtitle`)}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 text-xs italic"
                                >
                                    {t(error as Parameters<typeof t>[0])}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                             {!isLogin && (
                                <div className="space-y-3">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30 ml-1">{t('auth.form.name')}</label>
                                    <div className="relative group">
                                        <FiUser className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            id="auth-name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={t('auth.form.namePlaceholder')}
                                            required={!isLogin}
                                            className="w-full bg-transparent border-b border-foreground/10 py-4 pl-8 text-sm text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-foreground/10"
                                        />
                                    </div>
                                </div>
                            )}

                             <div className="space-y-3">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30 ml-1">{t('auth.form.email')}</label>
                                <div className="relative group">
                                    <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        id="auth-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('auth.form.emailPlaceholder')}
                                        required
                                        className="w-full bg-transparent border-b border-foreground/10 py-4 pl-8 text-sm text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-foreground/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30 ml-1">{t('auth.form.password')}</label>
                                    {isLogin && (
                                        <Link href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary/70 transition-colors">
                                            {t('auth.form.forgot')}
                                        </Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        id="auth-password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t('auth.form.passwordPlaceholder')}
                                        required
                                        className="w-full bg-transparent border-b border-foreground/10 py-4 pl-8 pr-12 text-sm text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-foreground/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/40 transition-colors px-2"
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-foreground text-background py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-foreground/90 hover:shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 mt-4 disabled:opacity-50"
                            >
                                {isLoading ? t(`${currentConfigKey}.loading`) : data.buttonText || t(`${currentConfigKey}.btn`)} 
                                <FiArrowRight size={16} />
                            </button>
                        </form>

                        <div className="pt-8 text-center border-t border-foreground/5">
                            <p className="text-xs text-foreground/30 font-light tracking-wide">
                                {t(`${currentConfigKey}.switch`)}{' '}
                                <Link
                                    href={isLogin ? "/register" : "/login"}
                                    className="ml-2 font-bold text-foreground uppercase tracking-widest hover:text-primary transition-colors underline underline-offset-8 decoration-foreground/10 hover:decoration-primary"
                                >
                                    {t(`${currentConfigKey}.switchLink`)}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

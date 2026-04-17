'use client';

import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { FiTruck, FiShield, FiHeart, FiClock } from 'react-icons/fi';

const IconMap: Record<string, React.ElementType> = {
  FiTruck,
  FiShield,
  FiHeart,
  FiClock,
};

import * as Sections from '@/types/sections';

export default function AboutUsSection({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.AboutUsData }) {
  const { t } = useTranslation();
  const { instances } = useCmsStore();
  const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
  const instanceData = passedData || (instance?.data as Sections.AboutUsData);
  const isVisible = instanceData?.isVisible !== false;
  if (!isVisible && instanceId) return null;
  const tagline = instanceData?.tagline || t('about.tagline');
  const title = instanceData?.heroTitle || t('about.heroTitle');
  const description = instanceData?.heroDesc || t('about.heroDesc');
  const mediaUrl = instanceData?.mediaUrl || "/image/alceix/hero.png";
  const variant = instanceData?.variant || 'default'; // default, split, centered, reverse

  const defaultFeatures: Sections.Feature[] = [
    {
      id: 'sustainable',
      icon: 'FiHeart',
      title: t('about.features.sustainable'),
      description: '',
    },
    {
      id: 'everyday',
      icon: 'FiTruck',
      title: t('about.features.everyday'),
      description: '',
    },
    {
      id: 'expert',
      icon: 'FiShield',
      title: t('about.features.expert'),
      description: '',
    },
    {
      id: 'delivery',
      icon: 'FiClock',
      title: t('about.features.delivery'),
      description: '',
    },
  ];

  const features: Sections.Feature[] = instanceData?.features || defaultFeatures;

  const renderIcon = (feature: Sections.Feature) => {
    if (typeof feature.icon === 'string' && IconMap[feature.icon]) {
      const IconComponent = IconMap[feature.icon];
      return <IconComponent className="w-8 h-8" />;
    }
    return <FiHeart className="w-8 h-8" />;
  };

  const renderFeatures = (gridCols: string) => (
    <div className={`grid ${gridCols} gap-8 mt-12`}>
      {features.map((feature: Sections.Feature, index: number) => (
        <div key={index} className="text-center group p-6 rounded-2xl transition-all hover:bg-primary/[0.03]">
          <div className="flex justify-center mb-4 text-primary transition-transform group-hover:scale-110">
            {renderIcon(feature)}
          </div>
          <h3 className="text-foreground font-bold text-sm md:text-base mb-2">
            {feature.title}
          </h3>
          {feature.description && (
            <p className="text-muted-foreground text-xs font-normal line-clamp-2">{feature.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderDefault = () => (
    <div className="w-[90%] md:w-[85%] mx-auto bg-primary/[0.03] rounded-[3rem] p-12 md:p-24 border border-primary/5">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
          <Image src={mediaUrl} alt={title} fill className="object-cover" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{tagline}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight italic">{title}</h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-normal">{description}</p>
          {renderFeatures('grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 pt-8')}
        </div>
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="flex flex-col text-left">
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{tagline}</span>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight italic">{title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-normal mb-12">{description}</p>
          <div className="grid grid-cols-2 gap-6">
            {features.slice(0, 4).map((f: Sections.Feature, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="shrink-0 text-primary">{renderIcon(f)}</div>
                <span className="text-sm font-bold uppercase tracking-widest">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl">
          <Image src={mediaUrl} alt={title} fill className="object-cover" />
        </div>
      </div>
    </div>
  );

  const renderCentered = () => (
    <div className="max-w-5xl mx-auto px-6 text-center">
      <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">{tagline}</span>
      <h2 className="text-4xl md:text-7xl font-bold text-foreground mb-8 leading-tight italic">{title}</h2>
      <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
        <Image src={mediaUrl} alt={title} fill className="object-cover" />
      </div>
      <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-normal max-w-3xl mx-auto mb-16">{description}</p>
      {renderFeatures('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')}
    </div>
  );

  const renderReverse = () => (
    <div className="relative w-full min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image src={mediaUrl} alt={title} fill className="object-cover scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Floating Story Card */}
      <div className="relative z-10 w-[90%] max-w-4xl bg-background/95 backdrop-blur-xl p-12 md:p-24 rounded-[4rem] shadow-3xl border border-white/20 text-center">
        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{tagline}</span>
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight italic">{title}</h2>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-normal max-w-2xl mx-auto mb-16">
          {description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.slice(0, 4).map((f: Sections.Feature, i: number) => (
            <div key={i} className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-lg shadow-primary/5">
                {renderIcon(f)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{f.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-32 overflow-hidden bg-background">
      {variant === 'default' && renderDefault()}
      {variant === 'split' && renderSplit()}
      {variant === 'centered' && renderCentered()}
      {variant === 'reverse' && renderReverse()}
    </section>
  );
}


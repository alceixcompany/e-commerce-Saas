import Image from 'next/image';

interface PaymentTrustLogosProps {
  compact?: boolean;
  showCaption?: boolean;
  className?: string;
}

export default function PaymentTrustLogos({
  compact = false,
  showCaption = true,
  className = '',
}: PaymentTrustLogosProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      aria-label="iyzico ile Öde, Visa ve Mastercard ödeme yöntemleri"
    >
      {showCaption && (
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-foreground/40 text-center">
          Güvenli ödeme altyapısı
        </p>
      )}
      <div className={`flex items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm ${compact ? 'px-3 py-2' : 'px-5 py-3'}`}>
        <Image
          src="/payment/iyzico/logo-band-colored.svg"
          alt="iyzico ile Öde, Visa ve Mastercard"
          width={429}
          height={32}
          unoptimized
          className={`h-auto w-full object-contain ${compact ? 'max-w-[280px]' : 'max-w-[429px]'}`}
        />
      </div>
    </div>
  );
}

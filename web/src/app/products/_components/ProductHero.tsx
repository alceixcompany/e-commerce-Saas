import Link from 'next/link';

interface ProductHeroProps {
    title: string;
    description: string;
    totalProducts: number;
    totalCategories: number;
}

export default function ProductHero({ title, description, totalProducts, totalCategories }: ProductHeroProps) {
    return (
        <div className="relative overflow-hidden border-b border-foreground/10">
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-foreground rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
                <div className="flex items-center gap-2 text-xs text-foreground/40 mb-8 animate-in fade-in duration-500">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-foreground">Products</span>
                </div>

                <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm text-foreground/50 font-light leading-relaxed mb-6">
                        {description}
                    </p>

                    <div className="flex items-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{totalProducts}</span>
                            <span className="text-foreground/40">Products</span>
                        </div>
                        <div className="w-px h-3 bg-foreground/10"></div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{totalCategories}</span>
                            <span className="text-foreground/40">Categories</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { getProductPlaceholder } from '@/lib/image-utils';

interface OrderSummaryProps {
    items: any[];
    currencySymbol: string;
    subtotal: number;
    discount: any;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
}

export default function OrderSummary({
    items,
    currencySymbol,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    currency
}: OrderSummaryProps) {
    return (
        <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-background border border-foreground/10 shadow-xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

                <h2 className="text-2xl font-serif text-foreground mb-8 pb-4 border-b border-foreground/10 flex justify-between items-center">
                    Your Order
                    <span className="text-sm font-sans font-normal text-foreground/40">{items.length} Items</span>
                </h2>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                            <div className="w-16 h-20 bg-foreground/5 overflow-hidden shrink-0 border border-foreground/10">
                                <img src={item.image || getProductPlaceholder()} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-foreground font-serif line-clamp-2 pr-2">{item.name}</h3>
                                    <p className="text-sm font-medium text-foreground">{currencySymbol}{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                                <p className="text-xs text-foreground/40">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-foreground/10">
                    <div className="flex justify-between text-sm">
                        <span className="text-foreground/50 font-light">Subtotal</span>
                        <span className="text-foreground">{currencySymbol}{subtotal.toLocaleString()}</span>
                    </div>
                    {discount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-light">Discount ({discount.code})</span>
                            <span className="text-green-600">-{currencySymbol}{discount.discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-foreground/50 font-light">Shipping</span>
                        <span className="text-primary font-bold text-xs uppercase tracking-widest">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-foreground/50 font-light">Tax</span>
                        <span className="text-foreground">{currencySymbol}0.00</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-8 pt-6 border-t border-foreground/10">
                    <span className="text-lg font-serif text-foreground">Total</span>
                    <div className="text-right">
                        <span className="text-xs text-foreground/40 block mb-1">{currency || 'USD'}</span>
                        <span className="text-3xl font-serif text-foreground font-medium">{currencySymbol}{total.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-8 bg-foreground/5 p-4 text-center">
                    <p className="text-[10px] text-foreground/40 leading-relaxed">
                        By proceeding with the payment, you agree to our Terms of Service and Privacy Policy. All transactions are secure and encrypted.
                    </p>
                </div>

            </div>
        </div>
    );
}

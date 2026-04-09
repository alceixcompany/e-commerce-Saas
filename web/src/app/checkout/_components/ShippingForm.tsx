import { ShippingAddress } from '@/types/order';

interface ShippingFormProps {
    shippingAddress: ShippingAddress;
    handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ShippingForm({
    shippingAddress,
    handleAddressChange
}: ShippingFormProps) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm">1</div>
                <h2 className="text-xl font-serif text-foreground">Shipping Details</h2>
            </div>

            <div className="bg-foreground/5 p-4 md:p-8 border border-foreground/10">
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Address Line</label>
                        <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                            <input
                                type="text"
                                name="address"
                                value={shippingAddress.address}
                                onChange={handleAddressChange}
                                placeholder="123 Alceix Drive"
                                required
                                className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">City</label>
                            <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                <input
                                    type="text"
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleAddressChange}
                                    placeholder="New York"
                                    required
                                    className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Postal Code</label>
                            <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={shippingAddress.postalCode}
                                    onChange={handleAddressChange}
                                    placeholder="10001"
                                    required
                                    className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Country</label>
                        <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                            <input
                                type="text"
                                name="country"
                                value={shippingAddress.country}
                                onChange={handleAddressChange}
                                placeholder="United States"
                                required
                                className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

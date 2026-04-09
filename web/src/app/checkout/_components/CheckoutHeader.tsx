import { FiLock } from 'react-icons/fi';

export default function CheckoutHeader() {
    return (
        <div className="flex items-center justify-between mb-12 border-b border-foreground/10 pb-8">
            <h1 className="text-2xl md:text-3xl font-serif text-foreground">Secure Checkout</h1>
            <div className="flex items-center gap-2 text-primary">
                <FiLock size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Encrypted & Safe</span>
            </div>
        </div>
    );
}

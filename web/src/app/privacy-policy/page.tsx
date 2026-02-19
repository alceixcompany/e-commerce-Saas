import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Ocean Gem",
    description: "Read our privacy policy to understand how Ocean Gem collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white pt-24 pb-24 font-sans text-gray-800">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <h1 className="font-serif text-4xl md:text-5xl italic text-gray-900 mb-12 text-center">Privacy Policy</h1>

                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium prose-a:text-[#C5A059] prose-a:no-underline hover:prose-a:underline">
                    <p className="lead text-xl text-gray-600 mb-8 font-light">
                        At Ocean Gem, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website or make a purchase.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        When you interact with Ocean Gem, we collect various types of information to improve your experience:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>Personal Identification Data:</strong> Name, email address, phone number, shipping and billing addresses provided during checkout.</li>
                        <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, operating system, and platform.</li>
                        <li><strong>Usage Data:</strong> Information about how you use our website, products, and services, including page interaction information.</li>
                        <li><strong>Marketing Data:</strong> Your preferences in receiving marketing from us and your communication preferences.</li>
                    </ul>

                    <h3>2. How We Use Your Data</h3>
                    <p>
                        We process your data lawfully, fairly, and transparently for the following purposes:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>Order Fulfillment:</strong> To process and deliver your orders, manage payments, and provide customer support.</li>
                        <li><strong>Account Management:</strong> To manage your registration and authentication on our platform.</li>
                        <li><strong>Service Improvement:</strong> To use data analytics to improve our website, products/services, marketing, customer relationships, and experiences.</li>
                        <li><strong>Marketing Communications:</strong> To send you newsletters and promotional offers, provided you have opted in to receive them.</li>
                    </ul>

                    <h3>3. Cookies and Tracking Technologies</h3>
                    <p>
                        Our website uses cookies to distinguish you from other users. This helps us provide you with a good experience when you browse our website and allows us to improve our site. You can set your browser to refuse all or some browser cookies, but please note that some parts of this website may become inaccessible or not function properly.
                    </p>

                    <h3>4. Data Security</h3>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Access to your personal data is limited to those employees, agents, contractors, and other third parties who have a business need to know.
                    </p>

                    <h3>5. Third-Party Sharing</h3>
                    <p>
                        We may share your data with trusted third parties to facilitate our operations, such as:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li>Payment processors (e.g., Stripe, PayPal) to securely process transactions.</li>
                        <li>Logistics partners to deliver your orders.</li>
                        <li>Analytics providers (e.g., Google Analytics) to help us understand site traffic.</li>
                    </ul>
                    <p>We do not sell your personal data to third parties for their own marketing purposes.</p>

                    <h3>6. Your Rights</h3>
                    <p>
                        Under data protection laws, you have rights including:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>Right to Access:</strong> You have the right to request copies of your personal data.</li>
                        <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                        <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                    </ul>

                    <h3>7. Contact Us</h3>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact our Data Protection Officer:
                    </p>
                    <address className="not-italic mt-4 text-gray-600 bg-gray-50 p-6 rounded-sm border border-gray-100">
                        <strong>Ocean Gem Corp.</strong><br />
                        Attn: Privacy Compliance<br />
                        123 Luxury Lane, Suite 400<br />
                        New York, NY 10012<br />
                        Email: <a href="mailto:privacy@oceangem.com">privacy@oceangem.com</a>
                    </address>
                </div>
            </div>
        </div>
    );
}

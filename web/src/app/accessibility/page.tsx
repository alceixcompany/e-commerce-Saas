import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Accessibility Statement | Ocean Gem",
    description: "Learn about Ocean Gem's commitment to making our website accessible to all users.",
};

export default function AccessibilityPage() {
    return (
        <div className="bg-white pt-24 pb-24 font-sans text-gray-800">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <h1 className="font-serif text-4xl md:text-5xl italic text-gray-900 mb-12 text-center">Accessibility Statement</h1>

                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium prose-a:text-[#C5A059] prose-a:no-underline hover:prose-a:underline">
                    <p className="lead text-xl text-gray-600 mb-8 font-light">
                        Ocean Gem is dedicated to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to make our website inclusive.
                    </p>

                    <h3>1. Our Commitment</h3>
                    <p>
                        We believe that the internet should be available and accessible to everyone. We are committed to providing a website that is accessible to the widest possible audience, regardless of circumstance and ability. To fulfill this promise, we aim to adhere as strictly as possible to the World Wide Web Consortium's (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level.
                    </p>

                    <h3>2. Measures to Support Accessibility</h3>
                    <p>
                        Ocean Gem takes the following measures to ensure accessibility:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>Inclusive Design:</strong> Integrating accessibility into our procurement practices and design process.</li>
                        <li><strong>Continuous Monitoring:</strong> Regularly scanning our site for accessibility barriers using automated tools and manual testing.</li>
                        <li><strong>Training:</strong> Providing accessibility training for our staff and content creators.</li>
                    </ul>

                    <h3>3. Conformance Status</h3>
                    <p>
                        The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. We are partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, though we are actively working to remediate these areas.
                    </p>

                    <h3>4. Feedback and Contact</h3>
                    <p>
                        We welcome your feedback on the accessibility of the Ocean Gem website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 my-6">
                        <ul className="list-none space-y-2 pl-0 mb-0">
                            <li><strong>Email:</strong> <a href="mailto:accessibility@oceangem.com">accessibility@oceangem.com</a></li>
                            <li><strong>Phone:</strong> +1 (800) 555-0199 (Mon-Fri, 9am - 6pm EST)</li>
                            <li><strong>Postal Address:</strong> 123 Luxury Lane, Suite 400, New York, NY 10012</li>
                        </ul>
                    </div>
                    <p>We try to respond to feedback within 2 business days.</p>


                </div>
            </div>
        </div>
    );
}

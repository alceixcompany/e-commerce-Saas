import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Ocean Gem",
    description: "Read the Terms of Service for using the Ocean Gem website, including our shipping, returns, and product care policies.",
};

export default function TermsOfServicePage() {
    return (
        <div className="bg-white pt-24 pb-24 font-sans text-gray-800 scroll-smooth">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <h1 className="font-serif text-4xl md:text-5xl italic text-gray-900 mb-12 text-center">Terms of Service</h1>



                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium prose-a:text-[#C5A059] prose-a:no-underline hover:prose-a:underline">
                    <section id="general" className="mb-20 scroll-mt-48">
                        <h2>1. General Terms and Conditions</h2>
                        <p>
                            Welcome to Ocean Gem ("we," "our," or "us"). By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully before making a purchase.
                        </p>
                        <p>
                            We reserve the right to update, change, or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
                        </p>
                        <h3>Intellectual Property</h3>
                        <p>
                            The content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Ocean Gem and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from this content without express written permission.
                        </p>
                        <h3>Governing Law</h3>
                        <p>
                            These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the State of New York, United States.
                        </p>
                    </section>

                    <section id="shipping" className="mb-20 scroll-mt-48 border-t border-gray-100 pt-12">
                        <h2>2. Shipping & Returns Policy</h2>

                        <h3>Shipping Policy</h3>
                        <p>
                            <strong>Processing Time:</strong> All orders are processed within 2-3 business days. Orders are not shipped or delivered on weekends or holidays.
                        </p>
                        <p>
                            <strong>International Shipping:</strong> We ship worldwide. Shipping charges for your order will be calculated and displayed at checkout. Please note that for international orders, customs duties, taxes, and import fees are the responsibility of the recipient and are not included in the shipping cost.
                        </p>
                        <p>
                            <strong>Lost or Stolen Packages:</strong> Ocean Gem is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.
                        </p>

                        <h3>Returns & Exchanges</h3>
                        <p>
                            We want you to be completely satisfied with your purchase. We accept returns up to <strong>30 days</strong> after delivery, provided the item is unused, in its original condition, and in its original packaging with all tags attached.
                        </p>
                        <p>
                            To initiate a return, please contact us at <a href="mailto:support@oceangem.com">support@oceangem.com</a> with your order number. Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-10 business days.
                        </p>
                        <p>
                            <strong>Non-Returnable Items:</strong> Custom-made or personalized jewelry pieces are final sale and cannot be returned or exchanged.
                        </p>
                    </section>

                    <section id="faq" className="mb-20 scroll-mt-48 border-t border-gray-100 pt-12">
                        <h2>3. Frequently Asked Questions (FAQ)</h2>
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-bold text-gray-900 m-0 text-lg">Do you offer a warranty on your jewelry?</h4>
                                <p className="mt-2 text-gray-600">Yes, we offer a lifetime warranty against manufacturing defects on all Ocean Gem jewelry. This warranty does not cover normal wear and tear, loss of stones, or theft. We recommend insuring your jewelry with a third-party provider.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 m-0 text-lg">Are your diamonds ethical and conflict-free?</h4>
                                <p className="mt-2 text-gray-600">Absolutely. We adhere to the strictest ethical standards. All our diamonds are sourced from suppliers who comply with the Kimberley Process Certification Scheme, ensuring they are conflict-free.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 m-0 text-lg">Can I customize a piece or create a bespoke design?</h4>
                                <p className="mt-2 text-gray-600">Yes, bespoke design is at the heart of Ocean Gem. Our master jewelers can work with you to create a one-of-a-kind piece. Please contact our concierge team to start the consultation process.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 m-0 text-lg">How do I track my order?</h4>
                                <p className="mt-2 text-gray-600">Once your order has shipped, you will receive an email confirmation containing your tracking number and a link to the carrier's website.</p>
                            </div>
                        </div>
                    </section>

                    <section id="size-guide" className="mb-20 scroll-mt-48 border-t border-gray-100 pt-12">
                        <h2>4. Size Guide</h2>
                        <p>
                            Ensuring the perfect fit is crucial for comfort and security. Use our guide below to determine your correct ring size. We recommend measuring your finger at the end of the day when it is likely to be at its largest.
                        </p>

                        <figure className="my-8">
                            <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm custom-scrollbar">
                                <table className="min-w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-900 uppercase bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 font-bold tracking-wider">US Size</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Inside Diameter (mm)</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Inside Circumference (mm)</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">UK Size</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">5</td>
                                            <td className="px-6 py-4">15.7</td>
                                            <td className="px-6 py-4">49.3</td>
                                            <td className="px-6 py-4">J 1/2</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">6</td>
                                            <td className="px-6 py-4">16.5</td>
                                            <td className="px-6 py-4">51.9</td>
                                            <td className="px-6 py-4">L 1/2</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">7</td>
                                            <td className="px-6 py-4">17.3</td>
                                            <td className="px-6 py-4">54.4</td>
                                            <td className="px-6 py-4">N 1/2</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">8</td>
                                            <td className="px-6 py-4">18.1</td>
                                            <td className="px-6 py-4">57.0</td>
                                            <td className="px-6 py-4">P 1/2</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">9</td>
                                            <td className="px-6 py-4">18.9</td>
                                            <td className="px-6 py-4">59.5</td>
                                            <td className="px-6 py-4">R 1/2</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <figcaption className="mt-2 text-sm text-gray-500 italic text-center">
                                Note: If you are between sizes, we recommend sizing up.
                            </figcaption>
                        </figure>

                        <h3>Tips for Measuring</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Measure your finger 3-4 times to eliminate an erroneous reading.</li>
                            <li>Avoid using string or paper to measure ring size as these materials can stretch or twist, yielding an inaccurate measurement.</li>
                            <li>If you have a ring that fits well, you can measure the inside diameter and compare it to our chart.</li>
                        </ul>
                    </section>

                    <section id="product-care" className="mb-20 scroll-mt-48 border-t border-gray-100 pt-12">
                        <h2>5. Product Care & Maintenance</h2>
                        <p>
                            Fine jewelry is a precious investment that requires proper care and attention to maintain its brilliance and integrity for generations.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 my-8">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h4 className="font-serif text-xl italic text-gray-900 mb-4">The Do's</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li><strong>Do</strong> clean your diamond jewelry regularly using a solution of warm water and mild dish soap.</li>
                                    <li><strong>Do</strong> store each piece separately in a soft pouch or lined jewelry box to prevent scratching.</li>
                                    <li><strong>Do</strong> have your settings checked by a professional jeweler annually to ensure stones are secure.</li>
                                    <li><strong>Do</strong> wipe gold jewelry with a soft chamois cloth after wear to remove oils and salts.</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h4 className="font-serif text-xl italic text-gray-900 mb-4">The Don'ts</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li><strong>Don't</strong> wear fine jewelry while swimming in chlorine pools or salt water.</li>
                                    <li><strong>Don't</strong> expose jewelry to harsh chemicals, perfumes, hairsprays, or cleaning agents.</li>
                                    <li><strong>Don't</strong> wear delicate gemstone rings during rigorous activities like gym workouts or gardening.</li>
                                    <li><strong>Don't</strong> use ultrasonic cleaners for organic gemstones like pearls, emeralds, or opals.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section id="modifications" className="mb-20 scroll-mt-48 border-t border-gray-100 pt-12">
                        <h2>6. Modifications to Service and Prices</h2>
                        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.</p>
                    </section>

                </div>
            </div>
        </div>
    );
}

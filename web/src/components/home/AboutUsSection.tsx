'use client';

export default function AboutUsSection() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: 'Sustainable Materials',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Designed for Everyday Living',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Carefully Crafted by Experts',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Hassle-Free Delivery & Returns',
    },
  ];

  return (
    <section className="" >
      <div className="w-[80%] mx-auto px-6 bg-[#F7F6F0] rounded-lg p-24">
        {/* Top Section - Image and Text */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          {/* Left Side - Image */}
          <div className="relative w-full h-[400px]  rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=1200&fit=crop"
              alt="Modern Living Room"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side - Text Content */}
          <div className="flex flex-col justify-center">
            <span className="text-zinc-500 text-xs font-normal uppercase tracking-wide mb-3">
              About Us
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-zinc-900 mb-5 leading-tight tracking-tight">
              Furniture with Heart,
              <br />
              Made for Living
            </h2>
            <p className="text-zinc-600 text-base leading-relaxed">
              Infurnish is more than just a furniture store – it's a destination for conscious living. We handpick every piece to offer high-quality, sustainable, and beautiful furniture that makes your space truly feel like home. With a passion for design and attention to detail, we help you create interiors that reflect your story.
            </p>
          </div>
        </div>

        {/* Bottom Section - Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4 text-zinc-900">
                {feature.icon}
              </div>
              <h3 className="text-zinc-900 font-normal text-base">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


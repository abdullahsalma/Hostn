import { ShieldCheck, Star, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    Icon: ShieldCheck,
    title: 'Verified Properties',
    description: 'Every listing is verified for quality and accuracy before going live.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    Icon: Star,
    title: 'Trusted Reviews',
    description: 'Real reviews from real guests to help you make the best choice.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    Icon: Headphones,
    title: '24/7 Support',
    description: 'Our team is always available to help before, during, and after your stay.',
    color: 'bg-green-50 text-green-600',
  },
  {
    Icon: CreditCard,
    title: 'Secure Payments',
    description: 'Fully encrypted transactions and flexible payment options you can trust.',
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function WhyHostn() {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">Why Choose Hostn?</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            We make finding and booking your perfect stay simple, safe, and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ Icon, title, description, color }) => (
            <div
              key={title}
              className="card p-6 hover:-translate-y-1 transition-transform duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

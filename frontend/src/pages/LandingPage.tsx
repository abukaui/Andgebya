import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ShoppingBag, 
  Bike, 
  ShieldCheck, 
  Map, 
  Zap, 
  Lock, 
  Smartphone,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TrackingDemo from '../components/TrackingDemo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Bike className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-slate-900">Tokkuma</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#how" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#couriers" className="hover:text-blue-600 transition-colors">For Couriers</a>
            <a href="#shops" className="hover:text-blue-600 transition-colors">For Shops</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95">
              Sign up
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-xl">
          <a href="#how" className="block text-lg font-semibold text-slate-700">How It Works</a>
          <a href="#couriers" className="block text-lg font-semibold text-slate-700">For Couriers</a>
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/login" className="w-full text-center py-3 font-bold border border-slate-200 rounded-xl">Log in</Link>
            <Link to="/register" className="w-full text-center py-3 font-bold bg-blue-600 text-white rounded-xl shadow-lg">Sign up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
  >
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
      <Icon className="w-7 h-7 text-slate-900 group-hover:text-blue-600 transition-colors" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-100 shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-700">Now live in your city</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.05]">
              Fast, Reliable <br />
              <span className="text-blue-600">Delivery</span> at Your Fingertips.
            </h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
              Connect with nearby couriers and deliver anything across your city in minutes. Seamless, secure, and smart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="group px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                Send a Delivery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95">
                Become a Courier
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative lg:ml-10"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-10 -right-10 bg-white shadow-2xl rounded-2xl p-4 flex items-center gap-4 border border-slate-50">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Courier-Bond™</p>
                <p className="text-[10px] text-slate-500">Verified & Insured</p>
              </div>
            </div>
            <TrackingDemo />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-4 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-500 font-medium">Three simple steps to your first delivery.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShoppingBag, step: 1, title: "Request", desc: "Create a delivery request via our app or web dashboard." },
              { icon: Map, step: 2, title: "Locate", desc: "Nearby verified couriers receive a broadcast for nearby orders." },
              { icon: Zap, step: 3, title: "Deliver", desc: "The first courier accepts and completes your delivery instantly." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative bg-white p-10 rounded-3xl border border-slate-100 text-center"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center shadow-lg">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                  <item.icon className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">Built for scale. <br />Designed for trust.</h2>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">Advanced technology ensures every delivery is reliable and secure.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Zap} title="Instant Matching" desc="Geospatial broadcast logic finds the right courier in milliseconds." />
            <FeatureCard icon={Map} title="Live Tracking" desc="Monitor your packages in real-time with live GPS location updates." />
            <FeatureCard icon={ShieldCheck} title="Courier-Bond™" desc="Verified couriers stake a deposit to ensure high-accountability deliveries." />
            <FeatureCard icon={Lock} title="Secure Payments" desc="Escrow-based system with 95/5 split logic ensures everyone gets paid." />
            <FeatureCard icon={Smartphone} title="Mobile First" desc="Powerful tools for Customers, Shops, and Couriers on all devices." />
            <FeatureCard icon={Bike} title="Telebirr Integration" desc="Ethiopia-first local payment support for CBE Birr and Telebirr." />
          </div>
        </div>
      </section>

      {/* For Businesses / Couriers */}
      <section id="shops" className="py-24 px-4 bg-slate-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 backdrop-blur-md p-12 rounded-[2.5rem] border border-slate-700"
          >
            <ShoppingBag className="w-12 h-12 text-blue-400 mb-8" />
            <h3 className="text-3xl font-black text-white mb-6 leading-tight">For Businesses</h3>
            <p className="text-slate-400 mb-10 text-lg leading-relaxed">
              Expand your shop's reach. Manage your catalog and use Tokkuma's courier network for all your delivery needs.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 text-white font-bold bg-blue-600 px-8 py-4 rounded-2xl hover:bg-blue-500 transition-colors active:scale-95">
              Register Your Shop <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-12 rounded-[2.5rem]"
          >
            <Bike className="w-12 h-12 text-blue-600 mb-8" />
            <h3 id="couriers" className="text-3xl font-black text-slate-900 mb-6 leading-tight">Become a Courier</h3>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">
              Flexible hours, fast payouts, and smart matching. Join the Ardi network and start earning today.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 text-white font-bold bg-slate-900 px-8 py-4 rounded-2xl hover:bg-slate-800 transition-colors active:scale-95">
              Start Delivering <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center px-12 py-20 rounded-[3rem] bg-blue-600 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter">Ready to start delivering?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
                Create Delivery
              </Link>
              <Link to="/register" className="px-10 py-5 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all active:scale-95">
                Become Courier
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Bike className="text-blue-600 w-6 h-6" />
                <span className="text-xl font-black tracking-tighter">Tokkuma</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering neighborhoods with smart, reliable delivery solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-all">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-all">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-all">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-all">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-all">Safety</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-all">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Newsletter</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                <button className="p-2 bg-slate-900 text-white rounded-xl">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2026 Tokkuma / Ardi Delivery. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-sm">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

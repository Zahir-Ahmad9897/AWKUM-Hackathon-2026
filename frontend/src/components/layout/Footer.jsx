// ─── Footer ───
import { Link } from "react-router-dom";
import { Heart, Mail, MapPin, Phone, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800 text-dark-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TrustFund</span>
            </div>
            <p className="text-sm leading-relaxed text-dark-400">
              The first fully verified crowdfunding platform for social impact in Pakistan. We connect generous donors with vetted organizations to create real change with full transparency.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/campaigns" className="hover:text-primary-400 transition-colors">Explore Campaigns</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Start a Campaign</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">NGO Dashboard</Link></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Trust & Safety</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Legal & Support</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">NGO Verification Process</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm text-dark-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <span>123 Tech Avenue, Software Park<br />Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>support@trustfund.pk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-dark-500">
          <p>© {new Date().getFullYear()} TrustFund. Built for Hackathon 2026.</p>
          <div className="flex gap-6">
            <span>Powered by React & Tailwind v4</span>
            <span>Made with <Heart className="w-4 h-4 inline text-rose-500 mx-1" /> by Zahir</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

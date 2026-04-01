import { HardHat, Mail, MapPin, Phone } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import type { Page } from "../App";

interface FooterProps {
  navigate: (p: Page) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">मजदूर सेतु</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              मजदूर और नियोक्ताओं को जोड़ने वाला भारत का विश्वसनीय मंच।
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                aria-label="Facebook"
                className="w-8 h-8 bg-white/10 hover:bg-orange rounded-full flex items-center justify-center transition-colors"
              >
                <SiFacebook className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="X (Twitter)"
                className="w-8 h-8 bg-white/10 hover:bg-orange rounded-full flex items-center justify-center transition-colors"
              >
                <SiX className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Instagram"
                className="w-8 h-8 bg-white/10 hover:bg-orange rounded-full flex items-center justify-center transition-colors"
              >
                <SiInstagram className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-4 text-orange">संपर्क करें</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange shrink-0" />
                info@majdoorsetu.in
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                नई दिल्ली, भारत
              </li>
            </ul>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-semibold mb-4 text-orange">मजदूर</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("workers")}
                  className="hover:text-white transition-colors"
                >
                  मजदूर खोजें
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("jobs")}
                  className="hover:text-white transition-colors"
                >
                  नौकरी देखें
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("home")}
                  className="hover:text-white transition-colors"
                >
                  श्रेणियां
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-semibold mb-4 text-orange">नियोक्ता</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("jobs")}
                  className="hover:text-white transition-colors"
                >
                  नौकरी पोस्ट करें
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("workers")}
                  className="hover:text-white transition-colors"
                >
                  मजदूर हायर करें
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("home")}
                  className="hover:text-white transition-colors"
                >
                  हमारे बारे में
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <span>© {year} मजदूर सेतु। सभी अधिकार सुरक्षित।</span>
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

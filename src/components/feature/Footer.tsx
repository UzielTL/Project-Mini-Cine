import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0f2a2a] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img
              src="https://public.readdy.ai/ai/img_res/9d651c59-ccb2-43f8-b293-20cb5f9f6a37.png"
              alt="Mini Cine Logo"
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-sm text-white/60 leading-relaxed">
              La experiencia de cine privado más exclusiva de la ciudad. Reserva tu sala y disfruta como nunca.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/60 hover:text-teal-400 transition-colors cursor-pointer">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/reservas" className="text-sm text-white/60 hover:text-teal-400 transition-colors cursor-pointer">
                  Reservar Sala
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm text-white/60 hover:text-teal-400 transition-colors cursor-pointer">
                  Panel Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-map-pin-line text-teal-400" />
                </div>
                Av. Principal 123, Ciudad
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-phone-line text-teal-400" />
                </div>
                +591 7XX XXX XXX
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-time-line text-teal-400" />
                </div>
                Lun–Dom: 10:00 – 23:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 Mini Cine Privado. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#" rel="nofollow" className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-teal-400 transition-colors cursor-pointer">
              <i className="ri-instagram-line text-lg" />
            </a>
            <a href="#" rel="nofollow" className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-teal-400 transition-colors cursor-pointer">
              <i className="ri-facebook-line text-lg" />
            </a>
            <a href="#" rel="nofollow" className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-teal-400 transition-colors cursor-pointer">
              <i className="ri-whatsapp-line text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

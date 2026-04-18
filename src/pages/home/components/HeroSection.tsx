import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://readdy.ai/api/search-image?query=luxurious%20private%20cinema%20room%20with%20teal%20and%20green%20ambient%20lighting%2C%20dark%20walls%2C%20comfortable%20premium%20seats%2C%20large%20screen%20glowing%2C%20cinematic%20atmosphere%2C%20elegant%20interior%20design%2C%20deep%20shadows%20with%20colorful%20accents&width=1920&height=1080&seq=hero1&orientation=landscape)',
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full text-center px-6">
        <span className="inline-block px-4 py-1.5 rounded-full border border-teal-400/60 text-teal-300 text-xs font-semibold uppercase tracking-widest mb-6">
          Experiencia Premium
        </span>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
          Tu Cine
          <br />
          <span className="text-teal-400">Privado</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto mb-10">
          Reserva tu sala exclusiva por horas. Vive el cine como nunca antes, solo para ti y los tuyos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/reservas"
            className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 cursor-pointer whitespace-nowrap text-sm"
          >
            Reservar Ahora
          </Link>
          <a
            href="#salas"
            className="px-8 py-4 border border-white/50 text-white hover:bg-white/10 font-medium rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap text-sm"
          >
            Ver Salas
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-arrow-down-line text-lg" />
        </div>
      </div>
    </section>
  );
}

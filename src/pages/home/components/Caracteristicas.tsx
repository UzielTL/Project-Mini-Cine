const features = [
  { icon: 'ri-4k-line', label: 'Televisor 4K', desc: 'Imagen cristalina en todas nuestras salas' },
  { icon: 'ri-volume-up-line', label: 'Dolby Atmos', desc: 'Sonido envolvente de última generación' },
  { icon: 'ri-sofa-line', label: 'Asientos VIP', desc: 'Sillones reclinables de terciopelo premium' },
  { icon: 'ri-lock-line', label: '100% Privado', desc: 'Tu sala exclusiva, sin interrupciones' },
  { icon: 'ri-temp-cold-line', label: 'Climatización', desc: 'Temperatura perfecta en todo momento' },
  { icon: 'ri-goblet-line', label: 'Snack Bar', desc: 'Palomitas, bebidas y más disponibles' },
];

export default function Caracteristicas() {
  return (
    <section className="py-20 px-6 md:px-10 bg-[#0f2a2a]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-widest">Por qué elegirnos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Una Experiencia <br />
              <span className="text-teal-400">Sin Igual</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Cada detalle de nuestras salas está diseñado para brindarte la mejor experiencia cinematográfica privada. Tecnología de punta, comodidad extrema y total privacidad.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 flex-shrink-0">
                    <i className={`${f.icon} text-base`} />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{f.label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative h-[420px] rounded-2xl overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=luxury%20private%20cinema%20interior%20with%20teal%20ambient%20lighting%2C%20premium%20recliner%20seats%2C%20large%20screen%2C%20dark%20elegant%20walls%20with%20LED%20strips%2C%20cinematic%20atmosphere%2C%20high%20end%20home%20theater%20design&width=700&height=500&seq=feat1&orientation=landscape"
              alt="Sala de cine privada"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f2a2a]/60 to-transparent" />
            {/* Stats overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-4">
              {[
                { num: '5', label: 'Salas' },
                { num: '500+', label: 'Reservas' },
                { num: '4.9★', label: 'Valoración' },
              ].map((stat, i) => (
                <div key={i} className="flex-1 bg-black/50 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-teal-400 font-bold text-lg">{stat.num}</p>
                  <p className="text-white/70 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

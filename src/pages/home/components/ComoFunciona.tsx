const pasos = [
  {
    icon: 'ri-search-eye-line',
    titulo: 'Elige tu Sala',
    desc: 'Explora nuestras salas pequeñas y grandes. Filtra por capacidad y disponibilidad.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: 'ri-calendar-check-line',
    titulo: 'Selecciona Fecha y Hora',
    desc: 'Elige el día, la hora de inicio y la duración de tu sesión (mínimo 1 hora).',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: 'ri-user-line',
    titulo: 'Ingresa tus Datos',
    desc: 'Completa el formulario con tu nombre. El sistema calcula el costo automáticamente.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: 'ri-film-line',
    titulo: '¡Disfruta!',
    desc: 'Llega a tu sala en el horario reservado y vive una experiencia de cine única.',
    color: 'bg-teal-50 text-teal-600',
  },
];

export default function ComoFunciona() {
  return (
    <section className="py-20 px-6 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-teal-600 text-xs font-semibold uppercase tracking-widest">Proceso Simple</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
            ¿Cómo Funciona?
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Reservar tu sala privada es rápido y sencillo. Solo 4 pasos y listo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pasos.map((paso, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-6">
              {/* Step number */}
              <div className="absolute top-0 right-6 text-6xl font-black text-gray-100 select-none leading-none">
                {i + 1}
              </div>
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${paso.color} mb-5 relative z-10`}>
                <i className={`${paso.icon} text-2xl`} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">{paso.titulo}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{paso.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

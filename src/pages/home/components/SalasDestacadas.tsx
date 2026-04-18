import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Sala } from '@/lib/supabase';

const FALLBACK_SALAS: Sala[] = [
  { id: 1, nombre: 'Sala Íntima Aurora', capacidad: 2, tipo: 'pequena', precio: 10, estado: 'disponible', descripcion: 'Sala íntima perfecta para parejas.', imagen: 'https://readdy.ai/api/search-image?query=cozy%20private%20mini%20cinema%20room%20for%20two%20people%20with%20comfortable%20velvet%20seats%2C%20ambient%20teal%20lighting%2C%20small%20screen%2C%20romantic%20atmosphere%2C%20dark%20walls%20with%20subtle%20glow%2C%20luxury%20interior%20design&width=600&height=400&seq=sala1&orientation=landscape', amenidades: [] },
  { id: 2, nombre: 'Sala Privada Nebula', capacidad: 2, tipo: 'pequena', precio: 10, estado: 'disponible', descripcion: 'Espacio exclusivo para dos personas.', imagen: 'https://readdy.ai/api/search-image?query=small%20private%20cinema%20room%20with%20two%20luxury%20recliner%20seats%2C%20dark%20ambient%20lighting%20with%20teal%20accents%2C%20modern%20minimalist%20design%2C%20private%20screening%20room%2C%20elegant%20interior&width=600&height=400&seq=sala2&orientation=landscape', amenidades: [] },
  { id: 3, nombre: 'Sala Familiar Cosmos', capacidad: 6, tipo: 'grande', precio: 40, estado: 'disponible', descripcion: 'Sala espaciosa ideal para grupos.', imagen: 'https://readdy.ai/api/search-image?query=private%20cinema%20room%20for%20small%20group%20of%206%20people%2C%20wide%20comfortable%20seats%20in%20rows%2C%20large%20screen%2C%20teal%20and%20green%20ambient%20lighting%2C%20modern%20luxury%20home%20theater%20design%2C%20dark%20elegant%20interior&width=800&height=500&seq=sala3&orientation=landscape', amenidades: [] },
  { id: 4, nombre: 'Sala Premium Galaxy', capacidad: 10, tipo: 'grande', precio: 40, estado: 'disponible', descripcion: 'Nuestra sala más grande para eventos.', imagen: 'https://readdy.ai/api/search-image?query=large%20private%20cinema%20room%20for%2010%20people%2C%20luxury%20theater%20seats%20arranged%20in%20rows%2C%20massive%20screen%2C%20sophisticated%20teal%20green%20ambient%20lighting%2C%20premium%20home%20theater%2C%20dark%20walls%20with%20LED%20accents&width=800&height=500&seq=sala4&orientation=landscape', amenidades: [] },
];

export default function SalasDestacadas() {
  const [salas, setSalas] = useState<Sala[]>(FALLBACK_SALAS);

  useEffect(() => {
    supabase.from('salas').select('*').eq('estado', 'disponible').order('id').limit(4).then(({ data }) => {
      if (data && data.length > 0) setSalas(data as Sala[]);
    });
  }, []);

  return (
    <section id="salas" className="py-20 px-6 md:px-10 bg-[#f8fafa]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-teal-600 text-xs font-semibold uppercase tracking-widest">Nuestras Salas</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">Elige tu Experiencia</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Desde salas íntimas para dos hasta espacios premium para grupos. Cada sala diseñada para una experiencia única.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {salas.map((sala) => (
            <div key={sala.id} className="bg-white rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                <img src={sala.imagen} alt={sala.nombre} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${sala.tipo === 'pequena' ? 'bg-emerald-500/90 text-white' : 'bg-teal-500/90 text-white'}`}>
                  {sala.tipo === 'pequena' ? 'Pequeña' : 'Grande'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{sala.nombre}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{sala.descripcion}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-group-line" /></div>
                    <span>Hasta {sala.capacidad} personas</span>
                  </div>
                  <span className="text-teal-600 font-bold text-sm">{sala.precio} Bs/h</span>
                </div>
                <Link to="/reservas" className="block w-full text-center py-2.5 bg-gray-900 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-colors duration-300 cursor-pointer whitespace-nowrap">
                  Reservar
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/reservas" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm cursor-pointer">
            Ver disponibilidad completa
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line" /></div>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { supabase, Sala, Reserva } from '@/lib/supabase';

function horaFinDesde(inicio: string, duracion: number): string {
  const [h, m] = inicio.split(':').map(Number);
  const total = h * 60 + m + duracion * 60;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function estaDisponible(salaId: number, fecha: string, horaInicio: string, horaFin: string, reservas: Reserva[]): boolean {
  return !reservas.some((r) => {
    if (r.sala_id !== salaId || r.fecha !== fecha || r.estado === 'cancelada') return false;
    return horaInicio < r.hora_fin && horaFin > r.hora_inicio;
  });
}

const horas = Array.from({ length: 14 }, (_, i) => {
  const h = i + 9;
  return `${String(h).padStart(2, '0')}:00`;
});

export default function ReservasPage() {
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'pequena' | 'grande'>('todas');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [salaSeleccionada, setSalaSeleccionada] = useState<Sala | null>(null);
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: salasData }, { data: reservasData }] = await Promise.all([
        supabase.from('salas').select('*').order('id'),
        supabase.from('reservas').select('*'),
      ]);
      if (salasData) setSalas(salasData as Sala[]);
      if (reservasData) setReservas(reservasData as Reserva[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const horaFin = horaInicio ? horaFinDesde(horaInicio, duracion) : '';
  const total = salaSeleccionada ? duracion * salaSeleccionada.precio : 0;

  // Advertencia en tiempo real: sala seleccionada + fecha + hora ocupada
  const horarioOcupado = useMemo(() => {
    if (!salaSeleccionada || !fecha || !horaInicio || !horaFin) return false;
    return !estaDisponible(salaSeleccionada.id, fecha, horaInicio, horaFin, reservas);
  }, [salaSeleccionada, fecha, horaInicio, horaFin, reservas]);

  // Reservas que chocan con la sala seleccionada en esa fecha
  const reservasOcupadas = useMemo(() => {
    if (!salaSeleccionada || !fecha) return [];
    return reservas.filter(
      (r) => r.sala_id === salaSeleccionada.id && r.fecha === fecha && r.estado !== 'cancelada'
    );
  }, [salaSeleccionada, fecha, reservas]);

  const salasFiltradas = useMemo(() => {
    return salas.filter((s) => {
      if (filtroTipo !== 'todas' && s.tipo !== filtroTipo) return false;
      if (s.estado === 'mantenimiento') return false;
      if (fecha && horaInicio && horaFin) {
        return estaDisponible(s.id, fecha, horaInicio, horaFin, reservas);
      }
      return true;
    });
  }, [filtroTipo, fecha, horaInicio, horaFin, reservas, salas]);

  const handleConfirmar = async () => {
    setError('');
    if (!salaSeleccionada || !fecha || !horaInicio || !cliente.trim()) {
      setError('Por favor completa todos los campos antes de confirmar.');
      return;
    }
    if (telefono.trim() && !/^[\d\s\+\-\(\)]{6,20}$/.test(telefono.trim())) {
      setError('El número de teléfono no tiene un formato válido.');
      return;
    }
    if (!estaDisponible(salaSeleccionada.id, fecha, horaInicio, horaFin, reservas)) {
      setError('La sala no está disponible en ese horario. Elige otro.');
      return;
    }
    setSubmitting(true);
    const { data, error: insertError } = await supabase.from('reservas').insert([{
      sala_id: salaSeleccionada.id,
      cliente: cliente.trim(),
      telefono: telefono.trim() || null,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      total,
      estado: 'confirmada',
    }]).select().maybeSingle();

    if (insertError) {
      setError('Error al guardar la reserva. Intenta de nuevo.');
      setSubmitting(false);
      return;
    }
    if (data) {
      setReservas((prev) => [...prev, data as Reserva]);
    }
    setSubmitting(false);
    setConfirmado(true);
  };

  const handleNuevaReserva = () => {
    setConfirmado(false);
    setSalaSeleccionada(null);
    setCliente('');
    setTelefono('');
    setFecha('');
    setHoraInicio('');
    setDuracion(1);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafa]">
      <Navbar />
      <div className="pt-20">
        <div className="bg-[#0f2a2a] py-12 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-widest">Reservas</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">Reserva tu Sala</h1>
            <p className="text-white/60 text-sm mt-2">Selecciona sala, fecha y hora para tu experiencia privada.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
          {confirmado ? (
            <div className="max-w-lg mx-auto">
              {/* Boleto Digital */}
              <div className="bg-white rounded-2xl overflow-hidden border border-teal-100">
                {/* Header del boleto */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-8 py-6 text-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 mx-auto mb-3">
                    <i className="ri-ticket-2-line text-3xl text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Boleto de Entrada Digital</h2>
                  <p className="text-white/80 text-xs mt-1">Mini Cine Privado — Reserva Confirmada</p>
                </div>

                {/* Separador tipo boleto */}
                <div className="relative flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#f8fafa] absolute -left-2.5 border-r border-teal-100" />
                  <div className="flex-1 border-t border-dashed border-teal-200 mx-4" />
                  <div className="w-5 h-5 rounded-full bg-[#f8fafa] absolute -right-2.5 border-l border-teal-100" />
                </div>

                {/* Cuerpo del boleto */}
                <div className="px-8 py-6 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-film-line text-xs text-teal-500" /></div>
                      Sala
                    </span>
                    <span className="font-bold text-gray-900">{salaSeleccionada?.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line text-xs text-teal-500" /></div>
                      Cliente
                    </span>
                    <span className="font-semibold text-gray-900">{cliente}</span>
                  </div>
                  {telefono && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-whatsapp-line text-xs text-teal-500" /></div>
                        WhatsApp
                      </span>
                      <span className="font-semibold text-gray-900 text-xs">{telefono}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-line text-xs text-teal-500" /></div>
                      Fecha
                    </span>
                    <span className="font-semibold text-gray-900">{fecha}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-time-line text-xs text-teal-500" /></div>
                      Horario
                    </span>
                    <span className="font-semibold text-gray-900">{horaInicio} – {horaFin}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-timer-line text-xs text-teal-500" /></div>
                      Duración
                    </span>
                    <span className="font-semibold text-gray-900">{duracion} hora{duracion > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Separador tipo boleto */}
                <div className="relative flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#f8fafa] absolute -left-2.5 border-r border-teal-100" />
                  <div className="flex-1 border-t border-dashed border-teal-200 mx-4" />
                  <div className="w-5 h-5 rounded-full bg-[#f8fafa] absolute -right-2.5 border-l border-teal-100" />
                </div>

                {/* Total */}
                <div className="px-8 py-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total a pagar</span>
                  <span className="text-3xl font-black text-teal-600">{total} Bs</span>
                </div>

                <div className="mx-8 mb-5 p-3 bg-teal-50 rounded-xl flex items-start gap-2.5">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-information-line text-teal-600 text-sm" />
                  </div>
                  <p className="text-xs text-teal-700">
                    Reserva confirmada. Guarda esta pantalla como comprobante de tu reserva.
                  </p>
                </div>

                <div className="px-8 pb-8">
                  <button onClick={handleNuevaReserva} className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap text-sm">
                    Hacer otra reserva
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtrar disponibilidad</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tipo de sala</label>
                      <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as 'todas' | 'pequena' | 'grande')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 cursor-pointer">
                        <option value="todas">Todas</option>
                        <option value="pequena">Pequeña (1-2)</option>
                        <option value="grande">Grande (3-10)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
                      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Hora inicio</label>
                      <select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 cursor-pointer">
                        <option value="">Seleccionar</option>
                        {horas.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Duración (horas)</label>
                      <select value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 cursor-pointer">
                        {[1,2,3,4,5,6].map((h) => <option key={h} value={h}>{h} hora{h > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 text-gray-400">
                    <div className="w-8 h-8 flex items-center justify-center mr-3"><i className="ri-loader-4-line text-2xl animate-spin" /></div>
                    <span className="text-sm">Cargando salas...</span>
                  </div>
                ) : salaSeleccionada ? (
                  <>
                  {/* Sala ya seleccionada — mostrar card compacta con opción de cambiar */}
                  <div className="bg-white rounded-2xl border-2 border-teal-500 overflow-hidden">
                    <div className="relative h-52 overflow-hidden">
                      <img src={salaSeleccionada.imagen} alt={salaSeleccionada.nombre} className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-line text-xs" /></div>
                        Seleccionada
                      </div>
                      <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${salaSeleccionada.tipo === 'pequena' ? 'bg-emerald-500/90 text-white' : 'bg-teal-500/90 text-white'}`}>
                        {salaSeleccionada.tipo === 'pequena' ? 'Pequeña' : 'Grande'}
                      </span>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{salaSeleccionada.nombre}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-group-line" /></div>
                            Hasta {salaSeleccionada.capacidad} personas
                          </span>
                          <span className="text-teal-600 font-bold text-sm">{salaSeleccionada.precio} Bs/h</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(salaSeleccionada.amenidades || []).slice(0, 4).map((a, i) => (
                            <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setSalaSeleccionada(null)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ml-4"
                      >
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line text-sm" /></div>
                        Cambiar sala
                      </button>
                    </div>
                  </div>

                  {/* Advertencia horario ocupado */}
                  {horarioOcupado && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 flex-shrink-0 mt-0.5">
                          <i className="ri-alarm-warning-line text-base" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-orange-700">Horario no disponible</p>
                          <p className="text-xs text-orange-600 mt-0.5">
                            Esta sala ya tiene una reserva que se cruza con el horario seleccionado. Elige otra hora.
                          </p>
                        </div>
                      </div>
                      {reservasOcupadas.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <p className="text-xs font-semibold text-orange-600 mb-2">Horarios ocupados ese día:</p>
                          <div className="flex flex-wrap gap-2">
                            {reservasOcupadas.map((r) => (
                              <span key={r.id} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">
                                {r.hora_inicio} – {r.hora_fin}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aviso disponibilidad OK */}
                  {!horarioOcupado && salaSeleccionada && fecha && horaInicio && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                        <i className="ri-checkbox-circle-line text-base" />
                      </div>
                      <p className="text-xs text-emerald-700 font-medium">
                        Horario disponible — puedes confirmar tu reserva.
                      </p>
                    </div>
                  )}
                  </>
                ) : (
                  /* Grilla de salas disponibles */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {salasFiltradas.length === 0 ? (
                      <div className="col-span-2 text-center py-16 text-gray-400">
                        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3"><i className="ri-calendar-close-line text-4xl" /></div>
                        <p className="text-sm">No hay salas disponibles para los filtros seleccionados.</p>
                      </div>
                    ) : salasFiltradas.map((sala) => (
                      <div
                        key={sala.id}
                        onClick={() => setSalaSeleccionada(sala)}
                        className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-teal-300"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img src={sala.imagen} alt={sala.nombre} className="w-full h-full object-cover object-top" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${sala.tipo === 'pequena' ? 'bg-emerald-500/90 text-white' : 'bg-teal-500/90 text-white'}`}>
                            {sala.tipo === 'pequena' ? 'Pequeña' : 'Grande'}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{sala.nombre}</h3>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-group-line" /></div>
                              Hasta {sala.capacidad} personas
                            </div>
                            <span className="text-teal-600 font-bold text-sm">{sala.precio} Bs/h</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(sala.amenidades || []).slice(0, 3).map((a, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[340px] flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 text-sm mb-5">Resumen de Reserva</h3>
                  {salaSeleccionada ? (
                    <div className="flex items-center gap-3 mb-5 p-3 bg-teal-50 rounded-xl">
                      <img src={salaSeleccionada.imagen} alt={salaSeleccionada.nombre} className="w-14 h-14 rounded-lg object-cover object-top flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{salaSeleccionada.nombre}</p>
                        <p className="text-xs text-gray-500">Hasta {salaSeleccionada.capacidad} personas</p>
                        <p className="text-xs text-teal-600 font-semibold">{salaSeleccionada.precio} Bs/hora</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-20 bg-gray-50 rounded-xl mb-5 text-gray-400 text-xs">
                      Selecciona una sala
                    </div>
                  )}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-line text-xs" /></div>
                        Fecha
                      </div>
                      <span className="font-medium text-gray-900 text-xs">{fecha || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-time-line text-xs" /></div>
                        Horario
                      </div>
                      <span className="font-medium text-gray-900 text-xs">{horaInicio && horaFin ? `${horaInicio} – ${horaFin}` : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-timer-line text-xs" /></div>
                        Duración
                      </div>
                      <span className="font-medium text-gray-900 text-xs">{duracion} hora{duracion > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Total</span>
                      <span className="text-2xl font-black text-teal-600">{total} Bs</span>
                    </div>
                    {salaSeleccionada && horaInicio && (
                      <p className="text-xs text-gray-400 mt-1">{duracion}h × {salaSeleccionada.precio} Bs/h</p>
                    )}
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tu nombre <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        placeholder="Ej: Carlos Mendoza"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Teléfono / WhatsApp
                        <span className="ml-1 text-gray-400">(para contactarte)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                          <i className="ri-whatsapp-line text-gray-400 text-sm" />
                        </div>
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="Ej: +591 70000000"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleConfirmar}
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap text-sm disabled:opacity-60"
                  >
                    {submitting ? 'Guardando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Sala, Reserva } from '@/lib/supabase';

type Tab = 'dashboard' | 'salas' | 'reservas' | 'usuarios';
type UserRole = 'admin' | 'superadmin';

interface AdminUser {
  id: number;
  username: string;
  rol: string;
  created_at: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('admin_role') as UserRole) || 'admin';
  });
  const [currentUsername, setCurrentUsername] = useState(() => {
    return localStorage.getItem('admin_username') || '';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [modalSala, setModalSala] = useState<Partial<Sala> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteReservaConfirm, setDeleteReservaConfirm] = useState<number | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<number | null>(null);
  const [salaError, setSalaError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reservas filter state
  const [filterCliente, setFilterCliente] = useState('');
  const [filterFecha, setFilterFecha] = useState('');
  const [filterEstado, setFilterEstado] = useState<'' | 'confirmada' | 'pendiente' | 'cancelada'>('');
  const [estadoDropdownOpen, setEstadoDropdownOpen] = useState<number | null>(null);

  // New user form state
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewUserPass, setShowNewUserPass] = useState(false);
  const [newUserError, setNewUserError] = useState('');
  const [newUserSuccess, setNewUserSuccess] = useState('');
  const [newUserLoading, setNewUserLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    const fetchData = async () => {
      setLoading(true);
      const [{ data: salasData }, { data: reservasData }] = await Promise.all([
        supabase.from('salas').select('*').order('id'),
        supabase.from('reservas').select('*, salas(nombre)').order('created_at', { ascending: false }),
      ]);
      if (salasData) setSalas(salasData as Sala[]);
      if (reservasData) {
        const mapped = (reservasData as (Reserva & { salas: { nombre: string } })[]).map((r) => ({
          ...r,
          sala_nombre: r.salas?.nombre || '',
        }));
        setReservas(mapped);
      }
      setLoading(false);
    };
    fetchData();
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn || currentRole !== 'superadmin') return;
    fetchAdminUsers();
  }, [loggedIn, currentRole]);

  useEffect(() => {
    if (estadoDropdownOpen === null) return;
    const handleClickOutside = () => setEstadoDropdownOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [estadoDropdownOpen]);

  const fetchAdminUsers = async () => {
    const { data } = await supabase.from('usuarios').select('id, username, rol, created_at').order('id');
    if (data) setAdminUsers(data as AdminUser[]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, password, rol')
      .eq('username', username.trim())
      .maybeSingle();

    if (error || !data) {
      setLoginError('Usuario o contraseña incorrectos.');
      setLoginLoading(false);
      return;
    }

    if (data.password !== password) {
      setLoginError('Usuario o contraseña incorrectos.');
      setLoginLoading(false);
      return;
    }

    setCurrentRole(data.rol as UserRole);
    setCurrentUsername(data.username);
    setLoggedIn(true);
    localStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('admin_role', data.rol);
    localStorage.setItem('admin_username', data.username);
    setLoginLoading(false);
  };

  const handleSaveSala = async () => {
    setSalaError('');
    if (!modalSala?.nombre || !modalSala?.capacidad || !modalSala?.precio) {
      setSalaError('Completa todos los campos obligatorios.');
      return;
    }
    const payload = {
      nombre: modalSala.nombre,
      capacidad: Number(modalSala.capacidad),
      tipo: Number(modalSala.capacidad) <= 2 ? 'pequena' : 'grande',
      precio: Number(modalSala.precio),
      estado: modalSala.estado || 'disponible',
      descripcion: modalSala.descripcion || '',
      imagen: modalSala.imagen || 'https://readdy.ai/api/search-image?query=private%20cinema%20room%20luxury%20teal%20ambient%20lighting%20modern%20interior%20design&width=600&height=400&seq=default&orientation=landscape',
      amenidades: modalSala.amenidades || [],
    };
    if (isEditing && modalSala.id) {
      const { error } = await supabase.from('salas').update(payload).eq('id', modalSala.id);
      if (!error) setSalas(salas.map((s) => s.id === modalSala.id ? { ...s, ...payload, id: modalSala.id } as Sala : s));
    } else {
      const { data, error } = await supabase.from('salas').insert([payload]).select().maybeSingle();
      if (!error && data) setSalas([...salas, data as Sala]);
    }
    setModalSala(null);
  };

  const handleDeleteSala = async (id: number) => {
    await supabase.from('salas').delete().eq('id', id);
    setSalas(salas.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  const handleDeleteReserva = async (id: number) => {
    await supabase.from('reservas').delete().eq('id', id);
    setReservas(reservas.filter((r) => r.id !== id));
    setDeleteReservaConfirm(null);
  };

  const handleChangeEstado = async (id: number, nuevoEstado: 'confirmada' | 'pendiente' | 'cancelada') => {
    const { error } = await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
    if (!error) {
      setReservas(reservas.map((r) => r.id === id ? { ...r, estado: nuevoEstado } : r));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError('');
    setNewUserSuccess('');
    if (!newUserUsername.trim() || !newUserPassword.trim()) {
      setNewUserError('Completa todos los campos.');
      return;
    }
    if (newUserPassword.length < 6) {
      setNewUserError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setNewUserLoading(true);
    // Check if username already exists
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', newUserUsername.trim())
      .maybeSingle();
    if (existing) {
      setNewUserError('Ese nombre de usuario ya existe.');
      setNewUserLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ username: newUserUsername.trim(), password: newUserPassword, rol: 'admin' }])
      .select()
      .maybeSingle();
    if (error || !data) {
      setNewUserError('Error al crear el usuario. Intenta de nuevo.');
    } else {
      setAdminUsers([...adminUsers, data as AdminUser]);
      setNewUserSuccess(`Usuario "${newUserUsername.trim()}" creado exitosamente.`);
      setNewUserUsername('');
      setNewUserPassword('');
    }
    setNewUserLoading(false);
  };

  const handleDeleteUser = async (id: number) => {
    await supabase.from('usuarios').delete().eq('id', id);
    setAdminUsers(adminUsers.filter((u) => u.id !== id));
    setDeleteUserConfirm(null);
  };

  const totalIngresos = reservas.filter((r) => r.estado === 'confirmada').reduce((acc, r) => acc + r.total, 0);
  const reservasHoy = reservas.filter((r) => r.fecha === new Date().toISOString().split('T')[0]).length;

  const filteredReservas = reservas.filter((r) => {
    const matchCliente = filterCliente === '' || r.cliente.toLowerCase().includes(filterCliente.toLowerCase());
    const matchFecha = filterFecha === '' || r.fecha === filterFecha;
    const matchEstado = filterEstado === '' || r.estado === filterEstado;
    return matchCliente && matchFecha && matchEstado;
  });

  const hasActiveFilters = filterCliente !== '' || filterFecha !== '' || filterEstado !== '';

  const clearFilters = () => {
    setFilterCliente('');
    setFilterFecha('');
    setFilterEstado('');
  };

  const navItems: { key: Tab; icon: string; label: string; onlySuper?: boolean }[] = [
    { key: 'dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
    { key: 'salas', icon: 'ri-door-open-line', label: 'Salas' },
    { key: 'reservas', icon: 'ri-calendar-check-line', label: 'Reservas' },
    { key: 'usuarios', icon: 'ri-user-settings-line', label: 'Usuarios', onlySuper: true },
  ];

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2a2a] to-[#1a4a4a] px-4">
        <div className="bg-white rounded-3xl p-10 w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 text-teal-700 hover:text-teal-500 transition-colors cursor-pointer text-sm font-semibold mb-8 group w-fit">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-teal-100 group-hover:bg-teal-200 transition-colors text-teal-600">
              <i className="ri-arrow-left-line" />
            </div>
            <span>Volver al inicio</span>
          </Link>
          <div className="text-center mb-8">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-teal-100 text-teal-600 mx-auto mb-4">
              <i className="ri-shield-keyhole-line text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Acceso Administrativo</h1>
            <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Usuario</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400"><i className="ri-user-line" /></div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contraseña</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400"><i className="ri-lock-line" /></div>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-teal-400" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 cursor-pointer">
                  <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
            </div>
            {loginError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>}
            <button type="submit" disabled={loginLoading} className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap text-sm mt-2 disabled:opacity-60">
              {loginLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafa]">

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside className={`fixed top-0 left-0 h-full w-[240px] bg-[#0f2a2a] flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">Mini Cine</p>
            <p className="text-white/40 text-xs mt-0.5">
              {currentRole === 'superadmin' ? 'Super Administrador' : 'Panel Admin'}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems
            .filter((item) => !item.onlySuper || currentRole === 'superadmin')
            .map((item) => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${tab === item.key ? 'bg-teal-500/20 text-teal-400' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
              >
                <div className="w-5 h-5 flex items-center justify-center"><i className={item.icon} /></div>
                {item.label}
                {item.onlySuper && (
                  <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">Super</span>
                )}
              </button>
            ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-4 py-2 mb-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-500/20 text-teal-400 flex-shrink-0">
              <i className="ri-user-line text-xs" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{currentUsername}</p>
              <p className="text-white/40 text-[10px] capitalize">{currentRole === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setLoggedIn(false);
              setCurrentRole('admin');
              setCurrentUsername('');
              setTab('dashboard');
              setSidebarOpen(false);
              localStorage.removeItem('admin_logged_in');
              localStorage.removeItem('admin_role');
              localStorage.removeItem('admin_username');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-logout-box-line" /></div>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0f2a2a] text-white hover:bg-[#1a4a4a] transition-colors cursor-pointer"
            >
              <i className="ri-menu-line text-lg" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {tab === 'dashboard' ? 'Dashboard' : tab === 'salas' ? 'Gestión de Salas' : tab === 'reservas' ? 'Reservas' : 'Gestión de Usuarios'}
              </h2>
              <p className="text-xs text-gray-400">Mini Cine Privado · Panel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${currentRole === 'superadmin' ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>
              <i className={currentRole === 'superadmin' ? 'ri-shield-star-line' : 'ri-user-line'} />
            </div>
            <div>
              <span className="font-medium">{currentUsername}</span>
              {currentRole === 'superadmin' && (
                <span className="ml-2 text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-semibold">Super Admin</span>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 flex items-center justify-center mr-3"><i className="ri-loader-4-line text-2xl animate-spin" /></div>
              <span className="text-sm">Cargando datos...</span>
            </div>
          ) : (
            <>
              {tab === 'dashboard' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {[
                      { icon: 'ri-door-open-line', label: 'Salas Activas', value: salas.filter((s) => s.estado === 'disponible').length, color: 'text-teal-600 bg-teal-50' },
                      { icon: 'ri-calendar-check-line', label: 'Reservas Hoy', value: reservasHoy, color: 'text-emerald-600 bg-emerald-50' },
                      { icon: 'ri-money-cny-circle-line', label: 'Ingresos Totales', value: `${totalIngresos} Bs`, color: 'text-cyan-600 bg-cyan-50' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${stat.color} mb-4`}>
                          <i className={`${stat.icon} text-2xl`} />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">Últimas Reservas</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>{['Cliente', 'Sala', 'Fecha', 'Horario', 'Total', 'Estado'].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {reservas.slice(0, 5).map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{r.cliente}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{r.sala_nombre}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{r.fecha}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{r.hora_inicio} – {r.hora_fin}</td>
                              <td className="px-5 py-4 text-sm font-semibold text-teal-600 whitespace-nowrap">{r.total} Bs</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' : r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                  {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'salas' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500">{salas.length} salas registradas</p>
                    <button onClick={() => { setModalSala({ estado: 'disponible' }); setIsEditing(false); setSalaError(''); }} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line" /></div>
                      Nueva Sala
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>{['Sala', 'Tipo', 'Capacidad', 'Precio/h', 'Estado', 'Acciones'].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {salas.map((sala) => (
                            <tr key={sala.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={sala.imagen} alt={sala.nombre} className="w-10 h-10 rounded-lg object-cover object-top flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{sala.nombre}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sala.tipo === 'pequena' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'}`}>
                                  {sala.tipo === 'pequena' ? 'Pequeña' : 'Grande'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{sala.capacidad} personas</td>
                              <td className="px-5 py-4 text-sm font-semibold text-teal-600 whitespace-nowrap">{sala.precio} Bs</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sala.estado === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {sala.estado === 'disponible' ? 'Disponible' : 'Mantenimiento'}
                                </span>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => { setModalSala({ ...sala }); setIsEditing(true); setSalaError(''); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-teal-100 text-gray-500 hover:text-teal-600 transition-colors cursor-pointer">
                                    <i className="ri-edit-line text-sm" />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(sala.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                                    <i className="ri-delete-bin-line text-sm" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'reservas' && (
                <div className="space-y-4">
                  {/* Filter bar */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-wrap items-end gap-4">
                      {/* Search by client */}
                      <div className="flex-1 min-w-[180px]">
                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Buscar cliente</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400">
                            <i className="ri-search-line text-sm" />
                          </div>
                          <input
                            type="text"
                            value={filterCliente}
                            onChange={(e) => setFilterCliente(e.target.value)}
                            placeholder="Nombre del cliente..."
                            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-colors"
                          />
                          {filterCliente && (
                            <button
                              onClick={() => setFilterCliente('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <i className="ri-close-line text-sm" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter by date */}
                      <div className="min-w-[160px]">
                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Fecha</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 pointer-events-none">
                            <i className="ri-calendar-line text-sm" />
                          </div>
                          <input
                            type="date"
                            value={filterFecha}
                            onChange={(e) => setFilterFecha(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-colors cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Filter by status */}
                      <div className="min-w-[160px]">
                        <label className="text-xs text-gray-500 mb-1.5 block font-medium">Estado</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {([
                            { value: '', label: 'Todos' },
                            { value: 'confirmada', label: 'Confirmada' },
                            { value: 'pendiente', label: 'Pendiente' },
                            { value: 'cancelada', label: 'Cancelada' },
                          ] as { value: '' | 'confirmada' | 'pendiente' | 'cancelada'; label: string }[]).map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setFilterEstado(opt.value)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                filterEstado === opt.value
                                  ? opt.value === '' ? 'bg-gray-800 text-white' : opt.value === 'confirmada' ? 'bg-emerald-500 text-white' : opt.value === 'pendiente' ? 'bg-yellow-400 text-white' : 'bg-red-400 text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clear filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-filter-off-line" /></div>
                          Limpiar
                        </button>
                      )}
                    </div>

                    {/* Results count */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {hasActiveFilters
                          ? `${filteredReservas.length} de ${reservas.length} reservas`
                          : `${reservas.length} reservas en total`}
                      </span>
                      {hasActiveFilters && filteredReservas.length === 0 && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Sin resultados</span>
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>{['#', 'Cliente', 'Sala', 'Fecha', 'Horario', 'Total', 'Estado', 'Acciones'].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredReservas.length > 0 ? filteredReservas.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">#{r.id}</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-teal-50 text-teal-600 flex-shrink-0">
                                    <i className="ri-user-line text-xs" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{r.cliente}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{r.sala_nombre}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{r.fecha}</td>
                              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{r.hora_inicio} – {r.hora_fin}</td>
                              <td className="px-5 py-4 text-sm font-semibold text-teal-600 whitespace-nowrap">{r.total} Bs</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="relative">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEstadoDropdownOpen(estadoDropdownOpen === r.id ? null : r.id); }}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                                      r.estado === 'confirmada'
                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                        : r.estado === 'pendiente'
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                    }`}
                                  >
                                    <span>{r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}</span>
                                    <div className="w-3 h-3 flex items-center justify-center">
                                      <i className={estadoDropdownOpen === r.id ? 'ri-arrow-up-s-line text-xs' : 'ri-arrow-down-s-line text-xs'} />
                                    </div>
                                  </button>
                                  {estadoDropdownOpen === r.id && (
                                    <div onClick={(e) => e.stopPropagation()} className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 overflow-hidden w-36" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                      {(['confirmada', 'pendiente', 'cancelada'] as const).map((estado) => (
                                        <button
                                          key={estado}
                                          onClick={() => {
                                            handleChangeEstado(r.id, estado);
                                            setEstadoDropdownOpen(null);
                                          }}
                                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                            r.estado === estado
                                              ? estado === 'confirmada' ? 'bg-emerald-50 text-emerald-700' : estado === 'pendiente' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'
                                              : 'text-gray-600 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${estado === 'confirmada' ? 'bg-emerald-500' : estado === 'pendiente' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                          {r.estado === estado && (
                                            <div className="ml-auto w-3 h-3 flex items-center justify-center">
                                              <i className="ri-check-line text-xs" />
                                            </div>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => setDeleteReservaConfirm(r.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Eliminar reserva"
                                >
                                  <i className="ri-delete-bin-line text-sm" />
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={8} className="px-5 py-16 text-center">
                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                                    <i className="ri-search-line text-2xl" />
                                  </div>
                                  <p className="text-sm font-medium">No se encontraron reservas</p>
                                  <p className="text-xs">Intenta con otros filtros</p>
                                  <button onClick={clearFilters} className="mt-1 text-xs text-teal-600 hover:text-teal-500 cursor-pointer underline underline-offset-2">
                                    Limpiar filtros
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'usuarios' && currentRole === 'superadmin' && (
                <div className="space-y-8">
                  {/* Create user form */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <i className="ri-user-add-line text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Crear Nuevo Usuario</h3>
                        <p className="text-xs text-gray-400">Agrega un nuevo administrador al sistema</p>
                      </div>
                    </div>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Nombre de usuario *</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400"><i className="ri-user-line" /></div>
                          <input
                            type="text"
                            value={newUserUsername}
                            onChange={(e) => setNewUserUsername(e.target.value)}
                            placeholder="ej: admin2"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Contraseña *</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400"><i className="ri-lock-line" /></div>
                          <input
                            type={showNewUserPass ? 'text' : 'password'}
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="Mín. 6 caracteres"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                          />
                          <button type="button" onClick={() => setShowNewUserPass(!showNewUserPass)} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 cursor-pointer">
                            <i className={showNewUserPass ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        {newUserError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{newUserError}</p>}
                        {newUserSuccess && <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mb-3">{newUserSuccess}</p>}
                        <button
                          type="submit"
                          disabled={newUserLoading}
                          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className={newUserLoading ? 'ri-loader-4-line animate-spin' : 'ri-user-add-line'} />
                          </div>
                          {newUserLoading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Users list */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">Usuarios del Sistema</h3>
                      <span className="text-xs text-gray-400">{adminUsers.length} usuarios</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>{['#', 'Usuario', 'Rol', 'Creado', 'Acciones'].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {adminUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">#{u.id}</td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${u.rol === 'superadmin' ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>
                                    <i className={u.rol === 'superadmin' ? 'ri-shield-star-line text-sm' : 'ri-user-line text-sm'} />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{u.username}</span>
                                  {u.username === currentUsername && (
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Tú</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.rol === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                                  {u.rol === 'superadmin' ? 'Super Admin' : 'Admin'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => setDeleteUserConfirm(u.id)}
                                  disabled={u.username === currentUsername}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={u.username === currentUsername ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                                >
                                  <i className="ri-delete-bin-line text-sm" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal: Edit/Create Sala */}
      {modalSala !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">{isEditing ? 'Editar Sala' : 'Nueva Sala'}</h3>
              <button onClick={() => setModalSala(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"><i className="ri-close-line" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                <input type="text" value={modalSala.nombre || ''} onChange={(e) => setModalSala({ ...modalSala, nombre: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" placeholder="Ej: Sala Aurora" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Capacidad *</label>
                  <input type="number" min={1} max={10} value={modalSala.capacidad || ''} onChange={(e) => setModalSala({ ...modalSala, capacidad: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" placeholder="1-10" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Precio/hora (Bs) *</label>
                  <input type="number" min={1} value={modalSala.precio || ''} onChange={(e) => setModalSala({ ...modalSala, precio: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" placeholder="10 o 40" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                <select value={modalSala.estado || 'disponible'} onChange={(e) => setModalSala({ ...modalSala, estado: e.target.value as 'disponible' | 'mantenimiento' })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 cursor-pointer">
                  <option value="disponible">Disponible</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                <textarea value={modalSala.descripcion || ''} onChange={(e) => setModalSala({ ...modalSala, descripcion: e.target.value })} rows={2} maxLength={500} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none" placeholder="Descripción de la sala..." />
              </div>
              {salaError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{salaError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalSala(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap">Cancelar</button>
              <button onClick={handleSaveSala} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Sala */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-500 mx-auto mb-4"><i className="ri-delete-bin-line text-2xl" /></div>
            <h3 className="font-bold text-gray-900 mb-2">¿Eliminar sala?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm cursor-pointer whitespace-nowrap">Cancelar</button>
              <button onClick={() => handleDeleteSala(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl text-sm cursor-pointer whitespace-nowrap">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Reserva */}
      {deleteReservaConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-500 mx-auto mb-4"><i className="ri-calendar-close-line text-2xl" /></div>
            <h3 className="font-bold text-gray-900 mb-2">¿Eliminar reserva?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer y la reserva se perderá permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteReservaConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm cursor-pointer whitespace-nowrap">Cancelar</button>
              <button onClick={() => handleDeleteReserva(deleteReservaConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl text-sm cursor-pointer whitespace-nowrap">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete User */}
      {deleteUserConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-500 mx-auto mb-4"><i className="ri-user-unfollow-line text-2xl" /></div>
            <h3 className="font-bold text-gray-900 mb-2">¿Eliminar usuario?</h3>
            <p className="text-sm text-gray-500 mb-6">El usuario perderá acceso al panel inmediatamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUserConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm cursor-pointer whitespace-nowrap">Cancelar</button>
              <button onClick={() => handleDeleteUser(deleteUserConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl text-sm cursor-pointer whitespace-nowrap">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

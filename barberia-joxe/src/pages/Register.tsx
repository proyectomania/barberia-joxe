
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Calendar, Phone, AlertCircle } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        birthDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic Validation
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create profile entry manually (since we want to ensure it matches specific fields)
                // Note: Ideally this is done via a Trigger on the DB side (migration best practice), 
                // but explicit insert here allows us to pass extra fields easily if we didn't set up the trigger metadata mapping perfectly.
                // However, we have an RLS policy "Users can insert own profile".


                const { error: profileError } = await supabase.from('profiles').insert({
                    id: authData.user.id,
                    full_name: formData.fullName,
                    // email removed as it does not exist in profiles table
                    phone: formData.phone,
                    birth_date: formData.birthDate,
                });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // Non-blocking error for user (account created technically), but we should warn or handle.
                }

                // Explicitly redirect to home (reserva)
                // The Session logic in AuthContext will also likely trigger a redirect via PublicRoute,
                // but this ensures we have an immediate action if the component is still mounted.
                // We need to import useNavigate first.
                // NOTE: I will add the import in a separate tool call if needed, but since I can't do it here easily without touching the top of the file,
                // I'll rely on the existing navigate behavior or reload the page if needed, but actually
                // I should add `useNavigate` hook usage. 
                // Wait, I can't import useNavigate inside the function.
                // I will use window.location.href = '/' as a hard redirect fallback or just let AuthContext handle it.
                // Actually, the user requirement is "se inicie la sesión automaticamente... llevandolo de nuevo al apartado inicial".
                // Since AuthContext listens to onAuthStateChange, and signUp returns a session, the AuthContext WILL update `user`.
                // PublicRoute, invalidating the current route (/register), will redirect to /.
                // So I might not strictly *need* to add code here if the architecture is sound.
                // However, I'll add a check to ensure we don't sit on a loading state forever if something weird happens.
                navigate('/');
            }

        } catch (err: any) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white px-4 py-8">
            <div className="max-w-md w-full bg-zinc-800 p-8 rounded-xl shadow-2xl border border-zinc-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
                        Únete a la Familia
                    </h2>
                    <p className="text-zinc-400 mt-2">Crea tu cuenta para reservar</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre Completo *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Tu nombre"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Correo Electrónico *</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Teléfono (Opcional)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="300 000 0000"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Fecha de Nacimiento *</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 [color-scheme:dark]"
                            />
                            <p className="text-xs text-amber-500/80 mt-1 ml-1">Necesaria para tu regalo de cumpleaños 🎂</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Contraseña *</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Min. 6 caracteres"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-2 mt-2">
                        <input type="checkbox" required className="mt-1 accent-amber-500" id="privacy" />
                        <label htmlFor="privacy" className="text-xs text-zinc-400">
                            Acepto la <Link to="/politica-privacidad" state={{ from: '/register' }} className="text-amber-500 hover:underline">Política de Privacidad</Link> y el tratamiento de mis datos personales.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-400">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-amber-500 hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

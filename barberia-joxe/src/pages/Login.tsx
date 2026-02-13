
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Success handled by AuthContext listener, redirects automatically
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white px-4">
            <div className="max-w-md w-full bg-zinc-800 p-8 rounded-xl shadow-2xl border border-zinc-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
                        BARBERÍA JOXE
                    </h2>
                    <p className="text-zinc-400 mt-2">Inicia sesión para reservar tu cita</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-8 text-center text-zinc-400">
                    <p className="mb-4">
                        ¿Aún no eres parte de la familia?
                    </p>
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700/50">
                        <p className="text-sm text-amber-500/90 mb-3 font-medium">
                            🎁 50% de descuento en tu cumpleaños
                        </p>
                        <Link
                            to="/register"
                            className="inline-block w-full border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-medium py-2 rounded-lg transition-colors mb-4"
                        >
                            Crear cuenta
                        </Link>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-zinc-700"></div>
                            <span className="flex-shrink mx-4 text-zinc-500 text-xs">O continúa como invitado</span>
                            <div className="flex-grow border-t border-zinc-700"></div>
                        </div>

                        <Link
                            to="/"
                            className="inline-block w-full text-zinc-400 hover:text-white text-sm py-2 transition-colors"
                        >
                            Continuar sin cuenta &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

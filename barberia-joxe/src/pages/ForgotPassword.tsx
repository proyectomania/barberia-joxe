
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el correo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white px-4">
            <div className="max-w-md w-full bg-zinc-800 p-8 rounded-xl shadow-2xl border border-zinc-700">
                <Link to="/login" className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Volver al inicio de sesión
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        Recuperar Contraseña
                    </h2>
                    <p className="text-zinc-400 mt-2">Te enviaremos un enlace para restablecerla.</p>
                </div>

                {sent ? (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">¡Correo enviado!</h3>
                        <p className="text-zinc-400">
                            Revisa tu bandeja de entrada (y spam). Hemos enviado un enlace a <strong>{email}</strong>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-6">
                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

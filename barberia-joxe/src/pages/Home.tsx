
import { useAuth } from '../context/AuthContext';
import { BookingProvider } from '../context/BookingContext';
import BookingWizard from '../components/booking/BookingWizard';
import { LogOut } from 'lucide-react';
import TeamSection from '../components/team/TeamSection';
import { Link } from 'react-router-dom';

export default function Home() {
    const { user, signOut } = useAuth();
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <a href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            BARBERÍA JOXE
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm text-zinc-400">Bienvenido,</p>
                                    <p className="text-sm font-bold text-white">{userName}</p>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <a
                                    href="/login"
                                    className="hidden md:inline-block px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
                                >
                                    Iniciar Sesión
                                </a>
                                <a
                                    href="/register"
                                    className="px-4 py-2 text-sm font-bold text-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 rounded-lg shadow-lg shadow-amber-900/20 transition-all hover:scale-105"
                                >
                                    Registrarse
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero / Booking Section */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Tu Estilo, <span className="text-amber-500">Nuestra Pasión</span>
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Reserva tu cita en segundos y vive la experiencia Joxe.
                    </p>
                </div>

                <BookingProvider>
                    <BookingWizard />
                </BookingProvider>
            </main>

            {/* Team Section */}
            <TeamSection />

            {/* Footer */}
            <footer className="bg-zinc-950 py-8 mt-12 border-t border-zinc-800 text-center text-zinc-500 text-sm">
                <p className="mb-2">© {new Date().getFullYear()} Barbería Joxe. Todos los derechos reservados.</p>
                <Link to="/politica-privacidad" className="text-zinc-600 hover:text-amber-500 transition-colors underline decoration-zinc-800 hover:decoration-amber-500">
                    Política de Privacidad
                </Link>
            </footer>
        </div>
    );
}

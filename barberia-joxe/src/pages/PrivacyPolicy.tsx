
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function PrivacyPolicy() {
    const location = useLocation();
    const backPath = location.state?.from || '/';
    const backText = backPath === '/register' ? 'Volver al registro' : 'Volver al inicio';

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                {/* Header */}
                <div className="border-b border-zinc-800 pb-8">
                    <Link to={backPath} className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        {backText}
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Política de Privacidad</h1>
                    <p className="text-zinc-500">Última actualización: Enero 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-zinc-300 leading-relaxed">
                    <p>
                        En <strong>BARBERÍA JOXE</strong>, creemos en la tecnología transparente y en el respeto absoluto por tu privacidad.
                        Esta política explica cómo tratamos tus datos personales cuando interactúas con nuestra web.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-amber-500 mb-3">1. Responsable del Tratamiento</h2>
                        <p>
                            Los datos recabados a través de este sitio web son gestionados por el equipo de <strong>BARBERÍA JOXE</strong>.
                            Puedes contactarnos directamente para cualquier duda sobre tus datos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-amber-500 mb-3">2. ¿Qué datos recogemos y para qué?</h2>
                        <p className="mb-4">Únicamente solicitamos los datos necesarios para gestionar tu reserva y contactarte:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-zinc-500">
                            <li>
                                <strong className="text-white">Datos:</strong> Nombre, correo electrónico, teléfono y detalles sobre tu cita.
                            </li>
                            <li>
                                <strong className="text-white">Finalidad:</strong> Gestionar tu solicitud de reserva, agendar citas y evaluar la disponibilidad de nuestros estilistas.
                            </li>
                            <li>
                                <strong className="text-white">Nota sobre el teléfono:</strong> Si nos proporcionas tu número, lo utilizaremos preferentemente para una comunicación ágil (ej. WhatsApp) respecto a tu cita.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-amber-500 mb-3">3. IA y tus Datos</h2>
                        <p>
                            Utilizamos herramientas de Inteligencia Artificial para optimizar nuestros procesos internos.
                            Sin embargo, tus datos de contacto no se utilizan para entrenar modelos públicos ni se comercializan con terceros.
                            La integración Humano-IA es nuestra filosofía: la tecnología procesa, pero un humano siempre supervisa la confidencialidad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-amber-500 mb-3">4. Tus Derechos</h2>
                        <p>
                            Tienes derecho a acceder, rectificar y suprimir tus datos en cualquier momento.
                            Si deseas que eliminemos tu información de nuestra base de datos, solo tienes que escribirnos indicando "BAJA" en el asunto.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-amber-500 mb-3">5. Aceptación</h2>
                        <p>
                            Al utilizar nuestros servicios de reserva, confirmas que has leído y comprendido esta política y consientes el tratamiento de tus datos para los fines descritos.
                        </p>
                    </section>
                </div>

                {/* Footer Link */}
                <div className="pt-8 border-t border-zinc-800 text-center">
                    <Link to={backPath} className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                        ← {backText}
                    </Link>
                </div>
            </div>
        </div>
    );
}


import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BookingSummary() {
    const { booking, prevStep, resetBooking } = useBooking();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Payment Logic - Hoisted to be accessible in handleConfirm
    const servicePrice = booking.servicePrice || 0;
    const isTuesday = booking.date ? booking.date.getDay() === 2 : false;

    // Calculate final price (apply 25% discount if Tuesday)
    const finalPrice = isTuesday ? servicePrice * 0.75 : servicePrice;

    // Calculate 40% deposit on the FINAL price
    const depositAmount = finalPrice * 0.40;
    const remainingAmount = finalPrice - depositAmount;

    const handleConfirm = async () => {
        // Validation: If user logged in, use user. If not, require guest fields.
        if (!user) {
            if (!guestName.trim() || !guestEmail.trim()) {
                setError('Por favor completa tu nombre y correo para confirmar la cita.');
                return;
            }
        }

        if (!booking.stylistId || !booking.serviceId || !booking.date || !booking.timeSlot) return;

        setLoading(true);
        setError(null);

        // Calculate start_time ISO
        const startTimeISO = booking.date.toISOString();

        const payload: any = {
            stylist_id: booking.stylistId,
            service_id: booking.serviceId,
            start_time: startTimeISO,
            price_at_booking: finalPrice, // Correct discounted price
            status: 'confirmed',
            user_id: user ? user.id : null,
            guest_name: user ? null : guestName,
            guest_email: user ? null : guestEmail
        };

        try {
            let error;

            if (booking.lockedBookingId) {
                // UPDATE existing locked booking
                const result = await supabase
                    .from('bookings')
                    .update(payload)
                    .eq('id', booking.lockedBookingId);
                error = result.error;
            } else {
                // FALLBACK: Insert new booking if no lock (shouldn't happen in normal flow but good safety)
                const result = await supabase
                    .from('bookings')
                    .insert(payload);
                error = result.error;
            }

            if (error) throw error;
            setConfirmed(true);
        } catch (err: any) {
            console.error(err);
            if (err.code === '23505' || err.message?.includes('violates unique constraint')) {
                setError('Este horario ya no está disponible. Por favor elige otro.');
            } else {
                setError(err.message || 'Error al confirmar la reserva.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (confirmed) {
        return (
            <div className="text-center py-12 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 rounded-full mb-6">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">¡Reserva Pre-Confirmada!</h2>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    Tu cita para el <strong>{booking.date && format(booking.date, "EEEE d 'de' MMMM", { locale: es })}</strong> a las <strong>{booking.timeSlot}</strong> ha sido registrada.
                    <br /><br />
                    <span className="text-amber-500 font-bold block text-lg">⚠️ IMPORTANTE: TU CITA NO ESTÁ ASEGURADA AÚN.</span>
                    Para finalizar la reserva, por favor realiza el abono del 40% a continuación.
                </p>
                <div className="bg-zinc-800 p-6 rounded-xl max-w-sm mx-auto mb-8 border border-zinc-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-zinc-400">Total Servicio:</span>
                        <span className="text-white font-bold">${finalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-zinc-700">
                        <span className="text-amber-500 font-bold">Abono (40%):</span>
                        <span className="text-amber-500 font-bold text-xl">${depositAmount.toLocaleString()}</span>
                    </div>

                    <a
                        href="https://recargas.nequi.com.co/billetera/recarga"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-[#20002c] hover:bg-[#3bf9f6] text-white hover:text-black font-bold py-3 rounded-lg transition-all mb-4 text-center border border-[#da0081]"
                    >
                        Pagar con Nequi
                    </a>
                    <p className="text-xs text-zinc-500">
                        En el concepto del pago pon: <strong className="text-white">{guestName || user?.user_metadata?.full_name || 'Tu Nombre'}</strong>
                    </p>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={resetBooking}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                        Volver al Inicio
                    </button>
                    <a
                        href={`https://wa.me/573124499862?text=${encodeURIComponent(`Hola, acabo de reservar para el servicio de ${booking.serviceName}. Ya realicé el abono de $${depositAmount.toLocaleString()}. Mi nombre es ${guestName || '...'}.`)}`}
                        target="_blank"
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                    >
                        Enviar Comprobante
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
                <button onClick={prevStep} className="p-2 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Resumen y Pago</h2>
                    <p className="text-zinc-400">Revisa los detalles y el abono requerido.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-6">
                {/* Service Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-800">
                    <div>
                        <h3 className="text-zinc-500 text-sm mb-1">Servicio</h3>
                        <p className="text-white font-bold">{booking.serviceName}</p>
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-sm mb-1">Estilista</h3>
                        <p className="text-white font-bold">{booking.stylistName}</p>
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-sm mb-1">Fecha</h3>
                        <p className="text-white font-bold capitalize">{booking.date && format(booking.date, "EEEE d 'de' MMMM", { locale: es })}</p>
                    </div>
                    <div>
                        <h3 className="text-zinc-500 text-sm mb-1">Hora</h3>
                        <p className="text-white font-bold">{booking.timeSlot}</p>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-zinc-950/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Precio Regular</span>
                        <span className="text-zinc-300">
                            ${servicePrice.toLocaleString()}
                        </span>
                    </div>
                    {isTuesday && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-500">Descuento Martes (25%)</span>
                            <span className="text-amber-500">-${(servicePrice * 0.25).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-zinc-800">
                        <span className="text-white">Total</span>
                        <span className="text-white">${finalPrice.toLocaleString()}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-amber-500 font-bold">Abono Mínimo (40%)</span>
                            <span className="text-amber-500 font-bold text-xl">${depositAmount.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-zinc-500 text-right">Restante en el local: <span className="text-zinc-300">${remainingAmount.toLocaleString()}</span></p>
                    </div>
                </div>

                {/* Guest Form Fields */}
                {!user && (
                    <div className="pt-4 border-t border-zinc-800 animate-fadeIn">
                        <h3 className="text-lg font-bold text-white mb-4">Tus Datos</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Te enviaremos la confirmación a este correo.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 transform hover:scale-[1.02] transition-all disabled:opacity-50"
            >
                {loading ? 'Procesando...' : `Confirmar y Ver Instrucciones de Pago`}
            </button>
        </div>
    );
}

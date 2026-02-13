
import { useRef, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { supabase } from '../../services/supabase';
import ServiceSelect from './ServiceSelect';
import StylistSelect from './StylistSelect';
import TimeSelect from './TimeSelect';
import BookingSummary from './BookingSummary';

export default function BookingWizard() {
    const { booking, setLockedBooking } = useBooking();
    const prevStepRef = useRef(booking.step);

    // Monitor step changes to release locks if backing out
    useEffect(() => {
        // If moving back from Step 3 (Time) to Step 2 (Stylist), release the lock
        if (prevStepRef.current === 3 && booking.step === 2) {
            if (booking.lockedBookingId) {
                // Fire and forget delete
                supabase.from('bookings').delete().eq('id', booking.lockedBookingId).then(({ error }) => {
                    if (error) console.error("Error releasing lock:", error);
                });
                setLockedBooking(null);
            }
        }
        prevStepRef.current = booking.step;
    }, [booking.step, booking.lockedBookingId, setLockedBooking]);

    const steps = [
        { number: 1, title: 'Servicio' },
        { number: 2, title: 'Estilista' },
        { number: 3, title: 'Horario' },
        { number: 4, title: 'Confirmar' },
    ];

    return (
        <div className="max-w-4xl mx-auto bg-zinc-800 rounded-xl shadow-2xl overflow-hidden border border-zinc-700">
            {/* Progress Bar */}
            <div className="bg-zinc-900 p-4 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                    {steps.map((s, idx) => (
                        <div key={s.number} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${booking.step >= s.number
                                ? 'border-amber-500 bg-amber-500 text-black'
                                : 'border-zinc-600 text-zinc-600'
                                } font-bold transition-colors`}>
                                {s.number}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${booking.step >= s.number ? 'text-white' : 'text-zinc-600'
                                } hidden md:inline`}>
                                {s.title}
                            </span>
                            {idx < steps.length - 1 && (
                                <div className={`h-1 w-8 md:w-16 mx-2 md:mx-4 ${booking.step > s.number ? 'bg-amber-500' : 'bg-zinc-800'
                                    } rounded transition-colors`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
                {booking.step === 1 && <ServiceSelect />}
                {booking.step === 2 && <StylistSelect />}
                {booking.step === 3 && <TimeSelect />}
                {booking.step === 4 && <BookingSummary />}
            </div>
        </div>
    );
}

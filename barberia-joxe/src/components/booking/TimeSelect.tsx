
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useBooking } from '../../context/BookingContext';
import { ArrowLeft, Clock } from 'lucide-react';
import { addDays, format, setHours, setMinutes, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TimeSelect() {
    const { booking, setTime, setLockedBooking, nextStep, prevStep } = useBooking();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Generate next available week days (Mon-Fri)
    const upcomingDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
        .filter(date => {
            const day = date.getDay();
            return day !== 0 && day !== 6; // Exclude Sunday (0) and Saturday (6)
        })
        .slice(0, 7); // Take next 7 valid days

    // Generate time slots (10 AM to 8 PM, hourly) - "según horario"
    const timeSlots = Array.from({ length: 11 }, (_, i) => {
        const hour = 10 + i;
        return `${hour}:00`;
    });

    useEffect(() => {
        async function fetchAvailability() {
            setLoading(true);
            if (!booking.stylistId) return;

            // Fetch bookings for the selected stylist on the selected date
            const startOfDayStr = startOfDay(selectedDate).toISOString();
            const endOfDayStr = addDays(startOfDay(selectedDate), 1).toISOString();

            // Fetch locked bookings that are recent (e.g., last 15 minutes) or confirmed bookings
            const now = new Date();
            const lockExpiration = new Date(now.getTime() - 15 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('bookings')
                .select('start_time, status, created_at')
                .eq('stylist_id', booking.stylistId)
                .gte('start_time', startOfDayStr)
                .lt('start_time', endOfDayStr)
                .neq('status', 'cancelled'); // Don't count cancelled bookings

            if (error) {
                console.error('Error checking availability:', error);
            } else {
                // Filter out expired locks
                const activeBookings = data.filter(b => {
                    if (b.status === 'confirmed') return true;
                    if (b.status === 'locked') {
                        // Check if lock is expired
                        return new Date(b.created_at) > new Date(lockExpiration);
                    }
                    return false;
                });

                // Extract occupied hours
                const occupied = activeBookings.map(b => {
                    const date = new Date(b.start_time);
                    return `${date.getHours()}:00`;
                });
                setOccupiedSlots(occupied);
            }
            setLoading(false);
        }

        fetchAvailability();
    }, [selectedDate, booking.stylistId]);

    const handleTimeSelect = async (time: string) => {
        const [hour] = time.split(':').map(Number);
        const dateWithTime = setHours(setMinutes(selectedDate, 0), hour);

        // 0. Release previous lock if exists
        if (booking.lockedBookingId) {
            await supabase.from('bookings').delete().eq('id', booking.lockedBookingId);
            setLockedBooking(null);
        }

        // 1. Create a LOCK in the database
        try {
            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    stylist_id: booking.stylistId,
                    service_id: booking.serviceId,
                    start_time: dateWithTime.toISOString(),
                    status: 'locked',
                    user_id: null, // Allow guest locking
                    price_at_booking: booking.servicePrice
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setLockedBooking(data.id);
                setTime(dateWithTime, time);
                nextStep();
            }
        } catch (err) {
            console.error("Error locking slot:", err);
            alert("Este horario ya no está disponible. Por favor elige otro.");
            // Refresh availability
            setSelectedDate(new Date(selectedDate)); // Trigger effect
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
                <button onClick={prevStep} className="p-2 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Elige Fecha y Hora</h2>
                    <p className="text-zinc-400">Verificando disponibilidad para <strong>{booking.stylistName}</strong></p>
                </div>
            </div>

            {/* Date Selector */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700">
                {upcomingDates.map((date) => {
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    const isTuesday = date.getDay() === 2;

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[5rem] p-4 rounded-xl border transition-all ${isSelected
                                ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                }`}
                        >
                            <span className="text-xs uppercase font-bold">{format(date, 'EEE', { locale: es })}</span>
                            <span className="text-2xl font-bold">{format(date, 'd')}</span>
                            {isTuesday && isSelected && <span className="text-[10px] font-bold mt-1">25% OFF</span>}
                        </button>
                    )
                })}
            </div>

            {/* Time Slots */}
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                Horarios Disponibles
            </h3>

            {loading ? (
                <div className="text-zinc-500">Cargando disponibilidad...</div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {timeSlots.map((time) => {
                        const isOccupied = occupiedSlots.includes(time);
                        // Disable past times if today
                        // Correctly combine selectedDate with the hour
                        const [hour] = time.split(':').map(Number);
                        const slotDate = setHours(setMinutes(new Date(selectedDate), 0), hour);

                        // Check if the slot is in the past
                        // We use new Date() for "now"
                        const now = new Date();
                        const isPast = isBefore(slotDate, now);

                        return (
                            <button
                                key={time}
                                disabled={isOccupied || isPast}
                                onClick={() => handleTimeSelect(time)}
                                className={`py-3 px-2 rounded-lg text-sm font-medium border transition-all ${isOccupied || isPast
                                    ? 'bg-zinc-800/10 border-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                                    : 'bg-zinc-900 border-zinc-700 hover:border-amber-500 text-white hover:bg-zinc-800'
                                    }`}
                            >
                                {time}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

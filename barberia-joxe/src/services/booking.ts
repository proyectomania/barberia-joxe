
import { supabase } from './supabase';

export interface Booking {
    id: string;
    stylist_id: string;
    service_id: string;
    user_id: string;
    appointment_date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    source: 'web' | 'whatsapp';
    price_at_booking: number;
}

export const bookingService = {
    async createBooking(booking: Omit<Booking, 'id' | 'user_id' | 'status' | 'created_at'>) {

        // If source is whatsapp, we might not want to save it to DB if user says "exceptuando..."
        // But usually we track it with a flag. The requirement says "exclude from analytics".
        // valid sources: 'web', 'whatsapp'

        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    stylist_id: booking.stylist_id,
                    service_id: booking.service_id,
                    appointment_date: booking.appointment_date,
                    price_at_booking: booking.price_at_booking,
                    source: booking.source || 'web',
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateBooking(id: string, updates: Partial<Booking>) {
        const { data, error } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getStylistStats(stylistId: string) {
        // Get all non-whatsapp bookings for this stylist
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                services (name)
            `)
            .eq('stylist_id', stylistId)
            .neq('source', 'whatsapp'); // Exclude WhatsApp bookings as requested

        if (error) throw error;

        if (!bookings || bookings.length === 0) {
            return {
                totalBookings: 0,
                totalRevenue: 0,
                averageRevenue: 0,
                mostPopularService: 'N/A'
            };
        }

        // Calculate analytics
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, b) => sum + b.price_at_booking, 0);
        const averageRevenue = totalRevenue / totalBookings;

        // Find most popular service
        const serviceCounts: Record<string, number> = {};
        bookings.forEach(b => {
            // @ts-ignore - joined data
            const serviceName = b.services?.name || 'Unknown';
            serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
        });

        const mostPopularService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0][0];

        return {
            totalBookings,
            totalRevenue,
            averageRevenue,
            mostPopularService
        };
    },

    async getMyBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                stylists (name),
                services (name, duration_minutes)
            `)
            .order('appointment_date', { ascending: true });

        if (error) throw error;
        return data;
    }
};

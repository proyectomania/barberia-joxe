
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useBooking } from '../../context/BookingContext';
import { ArrowLeft, User } from 'lucide-react';

interface Stylist {
    id: number;
    name: string;
    role: string;
    photo_url: string;
}

export default function StylistSelect() {
    const { booking, setStylist, nextStep, prevStep } = useBooking();
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStylists() {
            if (!booking.serviceId) return;

            // Fetch stylists that perform the selected service
            const { data, error } = await supabase
                .from('stylist_services')
                .select('stylist:stylists(id, name, role, photo_url)')
                .eq('service_id', booking.serviceId);

            if (error) {
                console.error('Error fetching stylists:', error);
            } else {
                // Flatten the response
                // @ts-ignore
                const mappedStylists = data.map((item: any) => item.stylist);
                setStylists(mappedStylists);
            }
            setLoading(false);
        }
        fetchStylists();
    }, [booking.serviceId]);

    const handleSelect = (stylist: Stylist) => {
        setStylist(stylist.id, stylist.name);
        nextStep();
    };

    if (loading) return <div className="text-white text-center p-10">Buscando especialistas...</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
                <button onClick={prevStep} className="p-2 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white">Elige tu Estilista</h2>
                    <p className="text-zinc-400">¿Quién quieres que te atienda?</p>
                </div>
            </div>

            {stylists.length === 0 ? (
                <div className="text-center text-zinc-500 py-10">
                    No hay estilistas disponibles para este servicio.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {stylists.map((stylist) => (
                        <button
                            key={stylist.id}
                            onClick={() => handleSelect(stylist)}
                            className="group bg-zinc-900 border border-zinc-700 hover:border-amber-500 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-amber-500/10 text-left"
                        >
                            <div className="h-48 bg-zinc-800 overflow-hidden relative">
                                {stylist.photo_url ? (
                                    <img src={stylist.photo_url} alt={stylist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                        <User size={48} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <h3 className="text-xl font-bold text-white">{stylist.name}</h3>
                                    <p className="text-amber-500 text-sm font-medium">{stylist.role}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-zinc-400">Disponible de 10 AM a 9 PM</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

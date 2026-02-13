
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useBooking } from '../../context/BookingContext';
import { Scissors, Sparkles, MessageCircle } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
}

export default function ServiceSelect() {
    const { setService, nextStep } = useBooking();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if today is Tuesday
    const isTuesday = new Date().getDay() === 2;
    const DISCOUNT_RATE = 0.25;

    async function fetchServices() {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.from('services').select('*').order('id');
            if (error) throw error;
            setServices(data || []);
        } catch (err: any) {
            console.error('Error fetching services:', err);
            setError(err.message || 'Error al cargar los servicios.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSelect = (service: Service) => {
        // External Services Logic (WhatsApp Redirect)
        if (service.category === 'tattoo') {
            const message = `Hola Joxe, espero que estés muy bien. Quisiera consultar la disponibilidad para el servicio de tatuaje. Si es posible atenderme lo más pronto posible, te lo agradecería mucho. Quedo atento(a). Gracias.`;
            window.open(`https://wa.me/573124499862?text=${encodeURIComponent(message)}`, '_blank');
            return;
        }

        // Eyebrows logic (checking name or category, prompt said 'Cejas Micropigmentación' services)
        if (service.name.toLowerCase().includes('cejas') || service.name.toLowerCase().includes('micropigmentación') || service.name.toLowerCase().includes('delineado')) {
            const message = `Hola Joxe, espero que estés muy bien. Quisiera consultar la disponibilidad para los servicios de micropigmentación. Si es posible atenderme lo más pronto posible, te lo agradecería mucho. Quedo atento(a). Gracias.`;
            window.open(`https://wa.me/573124499862?text=${encodeURIComponent(message)}`, '_blank');
            return;
        }

        // Regular Booking Logic
        // Always pass regular price to context. Discount is calculated at summary based on booking date.
        setService(service.id, service.name, service.price);
        nextStep();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Cargando servicios...</p>
        </div>
    );

    if (error) return (
        <div className="text-center p-8 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-red-500 mb-4">{error}</p>
            <button
                onClick={fetchServices}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors border border-zinc-600"
            >
                Intentar de nuevo
            </button>
        </div>
    );

    if (services.length === 0) return (
        <div className="text-center p-10 text-zinc-500 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
            <p>No hay servicios disponibles en este momento.</p>
        </div>
    );

    const categories = {
        barber: services.filter(s => s.category === 'barber'),
        beauty: services.filter(s => s.category === 'beauty' && !s.name.includes('Cejas') && !s.name.includes('Labios') && !s.name.includes('Delineado')),
        special: services.filter(s => s.category === 'tattoo' || s.name.toLowerCase().includes('tatuaje') || s.name.includes('Cejas') || s.name.includes('Labios') || s.name.includes('Delineado')),
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Elige tu Servicio</h2>
                <p className="text-zinc-400">Selecciona el tratamiento que deseas.</p>

                {isTuesday && (
                    <div className="mt-4 bg-amber-500/20 border border-amber-500 text-amber-500 p-3 rounded-lg inline-block animate-pulse">
                        🔥 <strong>¡MARTES DE DESCUENTO!</strong> 25% OFF en servicios seleccionados.
                    </div>
                )}


            </div>

            {Object.entries(categories).map(([key, categoryServices]) => (
                categoryServices.length > 0 && (
                    <div key={key}>
                        <h3 className="text-xl font-bold text-amber-500 mb-4 capitalize flex items-center gap-2">
                            {key === 'barber' && <Scissors size={20} />}
                            {key === 'beauty' && <Sparkles size={20} />}
                            {key === 'special' && <MessageCircle size={20} />}
                            {key === 'barber' ? 'Barbería' : key === 'beauty' ? 'Estética' : 'Servicios Especiales (Consultar)'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryServices.map((service) => {
                                const hasDiscount = isTuesday && (key === 'barber' || key === 'beauty');
                                const displayPrice = hasDiscount ? service.price * (1 - DISCOUNT_RATE) : service.price;

                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => handleSelect(service)}
                                        className="group bg-zinc-900 border border-zinc-700 hover:border-amber-500 p-4 rounded-xl text-left transition-all hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between h-full"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white group-hover:text-amber-500 transition-colors">{service.name}</h4>
                                                {key === 'special' ? (
                                                    <span className="bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-400 border border-zinc-700">WhatsApp</span>
                                                ) : (
                                                    <div className="text-right">
                                                        {hasDiscount && service.price > 0 && (
                                                            <span className="block text-xs text-zinc-500 line-through">${service.price.toLocaleString()}</span>
                                                        )}
                                                        <span className="text-amber-500 font-bold">
                                                            {service.price === 0 ? 'Cotizar' : `$${displayPrice.toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-400 line-clamp-2">{service.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}

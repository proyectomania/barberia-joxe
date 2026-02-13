
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Facebook, Instagram, User } from 'lucide-react';

interface Stylist {
    id: number;
    name: string;
    role: string;
    photo_url: string;
    social_links: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
    };
}

// Custom TikTok icon since Lucide might not have it or it might be named differently in some versions
const TikTokIcon = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

export default function TeamSection() {
    const [team, setTeam] = useState<Stylist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            // Fetch only the 3 main barbers as per prompt: Joxe, Stiven, Kevin
            const { data, error } = await supabase
                .from('stylists')
                .select('*')
                .in('name', ['Joxe', 'Stiven', 'Kevin'])
                .order('id');

            if (error) console.error('Error fetching team:', error);
            else setTeam(data || []);
            setLoading(false);
        }
        fetchTeam();
    }, []);

    if (loading) return null;

    return (
        <section className="py-16 bg-zinc-900 border-t border-zinc-800">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Nuestro Equipo</h2>

                <div className="max-w-2xl mx-auto mb-12 bg-zinc-800/50 p-6 rounded-xl border border-zinc-700/50">
                    <p className="text-lg text-zinc-300 italic">
                        "Apoya a tu barbero favorito compartiendo y reaccionando a su contenido en redes sociales. ¡Tu apoyo nos hace crecer!"
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {team.map((member) => (
                        <div key={member.id} className="group relative">
                            <div className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 group-hover:border-amber-500 transition-colors">
                                {member.photo_url ? (
                                    <img
                                        src={member.photo_url}
                                        alt={member.name}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <User size={64} />
                                    </div>
                                )}

                                {/* Social Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                                    <div className="flex gap-4">
                                        {member.social_links?.facebook && (
                                            <a
                                                href={member.social_links.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"
                                            >
                                                <Facebook size={20} />
                                            </a>
                                        )}
                                        {member.social_links?.instagram && (
                                            <a
                                                href={member.social_links.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-pink-600 text-white rounded-full hover:scale-110 transition-transform"
                                            >
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                        {member.social_links?.tiktok && (
                                            <a
                                                href={member.social_links.tiktok}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-black border border-zinc-700 text-white rounded-full hover:scale-110 transition-transform"
                                            >
                                                <TikTokIcon size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:hidden">
                                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

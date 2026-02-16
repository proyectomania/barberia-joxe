
import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    phone: string;
}

export const authService = {
    async signUp(email: string, password: string, metadata: { full_name: string; phone: string }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: metadata.full_name,
                    phone: metadata.phone
                }
            }
        });

        if (error) throw error;
        return data;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Return basic user info if profile fetch fails
            return {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name,
                phone: user.user_metadata.phone
            } as UserProfile;
        }

        return profile as UserProfile;
    }
};

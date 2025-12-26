import { supabase } from '../config/supabase';
import type { User } from '../types';

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface SignUpData extends AuthCredentials {
    name: string;
    phone?: string;
}

export const authService = {
    /**
     * Sign up a new user
     */
    async signUp(data: SignUpData) {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        phone: data.phone,
                    },
                },
            });

            if (authError) throw authError;

            // Create user profile in public.users table
            if (authData.user) {
                const { error: profileError } = await supabase.from('users').insert({
                    id: authData.user.id,
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    role: 'buyer', // Default role
                });

                if (profileError) throw profileError;
            }

            return { data: authData, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Sign in an existing user
     */
    async signIn({ email, password }: AuthCredentials) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Sign in with GitHub
     */
    async signInWithGithub() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/buyer/dashboard`,
                },
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Sign out the current user
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    /**
     * Get the current user session
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Get current user profile from database
     */
    async getCurrentUser(): Promise<{ data: User | null; error: unknown }> {
        try {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            console.log('getCurrentUser authUser:', authUser?.id);

            if (!authUser) {
                return { data: null, error: null };
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) throw error;

            return { data: data as User, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<User>) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Reset password
     */
    async resetPassword(email: string) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error };
        }
    },
};

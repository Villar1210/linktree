import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { authService, type SignUpData, type AuthCredentials } from '../services/auth.service';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (data: SignUpData) => Promise<{ error: unknown }>;
    signIn: (credentials: AuthCredentials) => Promise<{ error: unknown }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<{ error: unknown }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        authService.getSession().then(({ data }) => {
            if (data?.session) {
                loadUserProfile();
            } else {
                setLoading(false);
            }
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event);

            if (event === 'SIGNED_IN' && session) {
                await loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadUserProfile = async () => {
        const { data, error } = await authService.getCurrentUser();
        if (data && !error) {
            setUser(data);
        }
        setLoading(false);
    };

    const signUp = async (data: SignUpData) => {
        const { error } = await authService.signUp(data);
        if (!error) {
            await loadUserProfile();
        }
        return { error };
    };

    const signIn = async (credentials: AuthCredentials) => {
        const { error } = await authService.signIn(credentials);
        if (!error) {
            await loadUserProfile();
        }
        return { error };
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return { error: new Error('No user logged in') };

        const { data, error } = await authService.updateProfile(user.id, updates);
        if (data && !error) {
            setUser(data as User);
        }
        return { error };
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

'use client'
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                router.replace('/dashboard/');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged akan menangani navigasi
        } catch (error) {
            console.error('Error during login:', error);
            // Handle error (misalnya, tampilkan pesan error ke user)
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.replace('/login'); // atau halaman yang sesuai setelah logout
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
'use client'
import withAuth from '@/context/WithAuth'
import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useForm, Controller } from 'react-hook-form';
import { initializeApp } from 'firebase/app';
import {
    collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot,
    deleteDoc, query, where, updateDoc, arrayUnion, increment
} from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut,
} from "firebase/auth";
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';

import { auth, db, storage } from '../../../../firebase';
const AddPetugas = () => {
    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm();

    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Berhasil Membuat Konten', life: 3000 });
    }
    const [loading, setLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);
    const toast = useRef(null);
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(
                auth,
                data.email + '@admin.com',
                data.password
            )
            addDoc(collection(db, "petugas"), {
                name: data.name,
                email: data.email + '@admin.com',
                gender: data.gender,
                phone: data.phone,
            });
            showSuccess();
            reset();
        } catch (error) {
            console.error('Error saat menyimpan data:', error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
            <Toast
                ref={toast}
                position="top-right"
            />
            <h2 className='font-bold text-xl p-4'>Buat Akun Baru</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-lg bg-white m-6">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-black font-bold mb-2">
                        Nama Lengkap
                    </label>
                    <InputText
                        id="name"
                        {...register('name', { required: 'Nama harus diisi' })}
                        className={`w-full p-2 rounded-lg border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>



                <div className="mb-4">
                    <label htmlFor="email" className="block text-black font-bold mb-2">
                        Email
                    </label>
                    <div className='flex'>
                        <InputText
                            id="email"

                            {...register('email', {
                                required: 'Email harus diisi',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+$/i,
                                    message: 'Format email tidak valid',
                                },
                            })}
                            className={`w-44 p-2 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <div className='p-2'>
                            @admin.com
                        </div>
                    </div>

                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-black font-bold mb-2">
                        Password
                    </label>
                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: 'Password harus diisi',
                            minLength: {
                                value: 6,
                                message: 'Password minimal harus 6 karakter'
                            }
                        }}

                        render={({ field }) => (
                            <Password
                                id="password"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={` p-2 rounded-lg border-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                toggleMask
                                feedback={false}
                            />
                        )}
                    />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="gender" className="block text-black font-bold mb-2">
                        Jenis Kelamin
                    </label>
                    <select
                        id="gender"

                        {...register('gender', { required: 'Jenis kelamin harus dipilih' })}
                        className={`w-full p-2 rounded-lg border-2 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option disabled selected value="">Pilih Kategori</option>
                        <option value="Laki-Laki">Laki-Laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>
                    {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="phone" className="block text-black font-bold mb-2">
                        Nomor Telepon
                    </label>
                    <InputText
                        id="phone"
                        {...register('phone', {
                            required: 'Nomor telepon harus diisi',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Nomor telepon harus berupa angka',
                            },
                        })}
                        className={`w-full p-2 rounded-lg border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
                </div>


                <button
                    type="submit"
                    className="bg-white text-blue-950 font-bold py-2 px-4 rounded-lg border-2 border-blue-950 hover:bg-gray-200"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Submit'}
                </button>
            </form>

        </div>
    )
}

export default withAuth(AddPetugas)
'use client'
import React, { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';

const LoginPage = () => {
    let error = '';
    const { login } = useContext(AuthContext);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (data.email == 'admin@mail.com') {


            try {
                await login(data.email, data.password);
            } catch (error) {
                console.error('Error during login:', error);
            }
        }
        else {
            error = '<div className="text-red-600">Email Bukan Admin <div>'
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-blue-950 mb-6">Login</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 font-bold mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''
                                }`}
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <span className="text-red-500">{errors.email.message}</span>
                        )}
                        {
                            error
                        }
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 font-bold mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''
                                }`}
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        {errors.password && (
                            <span className="text-red-500">{errors.password.message}</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-950 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
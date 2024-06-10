'use client'
import { useState, useEffect } from 'react';
import { FaBookMedical, FaThLarge, FaUserPlus, FaBook } from "react-icons/fa";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ProgressSpinner } from 'primereact/progressspinner';

export const Navigation = () => {
    const currentPath = usePathname();
    const [loading, setLoading] = useState(false);


    return (

        <>

            <div className='w-[15%] fixed bg-white border-r-[1px] border-gray-200  min-h-screen text-blue-950 font-bold text-xl'>
                <div className='p-12'>
                    Selamat Datang,
                    Admin
                </div>
                <Link href={'/dashboard'}>
                    <div
                        className={`flex flex-row justify-center space-x-12 p-4 py-6 hover:bg-blue-950 transition-color duration-150 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard' ? 'bg-blue-950' : ''
                            }`}
                    >
                        <FaThLarge size={28} />
                        <div>Dahsboard</div>
                    </div>
                </Link>
                <Link href={'/dashboard/Books'}>
                    <div
                        className={`flex flex-row justify-center space-x-12 p-4 py-6 hover:bg-blue-950 transition-color duration-150 ease-in-out cursor-pointer 
                        ${currentPath === '/dashboard/Books' ? 'bg-blue-950' : ''
                            }`}
                    >
                        <FaBook size={28} />
                        <div>Daftar Buku</div>
                    </div>
                </Link>
                <Link href={'/dashboard/AddBook'}>
                    <div
                        className={`flex flex-row justify-center space-x-12 p-4 py-6 hover:bg-blue-950 transition-color duration-150 ease-in-out cursor-pointer 
                        ${currentPath === '/dashboard/AddBook' ? 'bg-blue-950' : ''
                            }`}
                    >
                        <FaBookMedical size={28} />
                        <div>Input Buku</div>
                    </div>
                </Link>
                <Link href={'/dashboard/AddMember'}>
                    <div
                        className={`flex flex-row justify-center space-x-12 p-4 py-6 hover:bg-blue-950 transition-color duration-150 ease-in-out cursor-pointer 
                        ${currentPath === '/dashboard/AddMember' ? 'bg-blue-950' : ''
                            }`}
                    >
                        <FaUserPlus size={28} />
                        <div>Buat Akun</div>
                    </div>
                </Link>

            </div>
        </>
    )
}

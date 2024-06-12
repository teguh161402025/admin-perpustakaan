'use client'
import { useState, useEffect, useContext } from 'react';
import { FaBookMedical, FaThLarge, FaSignOutAlt, FaUserPlus, FaClock, FaMoneyBillAlt, FaBook, FaCircleNotch, FaRegCheckCircle, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AuthContext } from '@/context/AuthContext';
export const Navigation = () => {
    const { logout } = useContext(AuthContext);
    const currentPath = usePathname();
    const [loading, setLoading] = useState(false);
    const onSubmit = async (data) => {
        try {
            await logout(data.email, data.password);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (

        <>

            <div className='w-[15%] fixed bg-white border-r-[1px] border-gray-100  min-h-screen text-blue-900 text-md'>
                <div className='p-4'>
                    Selamat Datang,
                    Admin
                </div>
                <div>
                    <div>
                        <div className='flex p-2 space-x-4 ml-4'>
                            <FaCircleNotch className='my-[4px]' color='#14629c' size={18} />
                            <label className='text-black font-bold text-md'>Dashboard</label>
                        </div>

                        <div className='text-gray-500 2xl:text-sm md:text-[10px] font-semibold pl-[17%]'>
                            <Link href={'/dashboard'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-blue-600 hover:bg-blue-100 hover:text-blue-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard' ? 'border-r-4  border-r-blue-600 bg-blue-100 text-blue-600' : ''
                                        }`}
                                >
                                    <FaThLarge size={18} className=' ' />
                                    <div>Peminjaman</div>
                                </div>
                            </Link>
                            <Link href={'/dashboard/Confirmation'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4  space-x-6 p-2   hover:border-r-4 hover:border-r-blue-600 hover:bg-blue-100 hover:text-blue-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/Confirmation' ? 'border-r-4 border-r-blue-600 bg-blue-100 text-blue-600' : ''
                                        }`}
                                >
                                    <FaRegCheckCircle size={18} className=' ' />
                                    <div>Konfirmasi</div>
                                </div>
                            </Link>
                            <Link href={'/dashboard/Pengembalian'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-blue-600 hover:bg-blue-100 hover:text-blue-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/Pengembalian' ? 'border-r-4 border-r-blue-600 bg-blue-100 text-blue-600' : ''
                                        }`}
                                >
                                    <FaArrowRight size={18} className=' ' />
                                    <div>Pengembalian</div>
                                </div>
                            </Link>
                            <Link href={'/dashboard/Pengambilan'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-blue-600 hover:bg-blue-100 hover:text-blue-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/Pengambilan' ? 'border-r-4 border-r-blue-600 bg-blue-100 text-blue-600' : ''
                                        }`}
                                >
                                    <FaArrowLeft size={18} className=' ' />
                                    <div>Pengambilan</div>
                                </div>
                            </Link>
                            <Link href={'/dashboard/Denda'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-blue-600 hover:bg-blue-100 hover:text-blue-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/Denda' ? 'border-r-4 border-r-blue-600 bg-blue-100 text-blue-600' : ''
                                        }`}
                                >
                                    <FaMoneyBillAlt size={18} className=' ' />
                                    <div>Denda</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className='mt-2'>
                        <div className='flex p-2 space-x-4 ml-4 '>
                            <FaCircleNotch className='my-[4px]' color='#8fce00' size={18} />
                            <label className='text-black font-bold text-md'>Buku</label>
                        </div>

                        <div className='text-gray-500 2xl:text-sm md:text-[10px] font-semibold pl-[17%]'>
                            <Link href={'/dashboard/Books'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-lime-600 hover:bg-lime-100 hover:text-lime-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/Books' ? 'border-r-4 border-r-lime-600 bg-lime-100 text-lime-600' : ''
                                        }`}
                                >
                                    <FaBook size={18} className=' ' />
                                    <div >Daftar Buku</div>
                                </div>
                            </Link>
                            <Link href={'/dashboard/AddBook'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-lime-600 hover:bg-lime-100 hover:text-lime-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/AddBook' ? 'border-r-4 border-r-lime-600 bg-lime-100 text-lime-600' : ''
                                        }`}
                                >
                                    <FaBookMedical size={18} className=' ' />
                                    <div>Input Buku</div>
                                </div>
                            </Link>

                        </div>
                    </div>
                    <div className='mt-2'>
                        <div className='flex p-2 space-x-4 ml-4'>
                            <FaCircleNotch className='my-[4px]' color='#765cb9' size={18} />
                            <label className='text-black font-bold text-md'>Laporan</label>
                        </div>

                        <div className='text-gray-500 2xl:text-sm md:text-[10px] font-semibold pl-[17%]'>
                            <Link href={'/dashboard/History'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:bopurple-r-lime-600 hover:bg-purple-100 hover:text-purple-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/History' ? 'border-r-4 border-r-purple-600 bg-purple-100 text-purple-600' : ''
                                        }`}
                                >
                                    <FaClock size={18} className=' ' />
                                    <div>History Peminjaman</div>
                                </div>
                            </Link>


                        </div>
                    </div>

                    <div className='mt-2'>
                        <div className='flex p-2 space-x-4 ml-4'>
                            <FaCircleNotch className='my-[4px]' color='#e69138' size={18} />
                            <label className='text-black font-bold text-md'>User</label>
                        </div>

                        <div className='text-gray-500 2xl:text-sm md:text-[10px] font-semibold pl-[17%]'>
                            <Link href={'/dashboard/AddMember'}>
                                <div
                                    className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-orange-600 hover:bg-orange-100 hover:text-orange-600 transition-color duration-100 ease-in-out cursor-pointer
                         ${currentPath === '/dashboard/AddMember' ? 'border-r-4 border-r-orange-600 bg-orange-100 text-orange-600' : ''
                                        }`}
                                >
                                    <FaUserPlus size={18} className=' ' />
                                    <div>Buat Akun Baru</div>
                                </div>
                            </Link>
                            <div onClick={onSubmit}
                                className={`flex flex-row rounded-l-xl pl-4 space-x-6 p-2   hover:border-r-4 hover:border-r-orange-600 hover:bg-orange-100 hover:text-orange-600 transition-color duration-100 ease-in-out cursor-pointer
                       `}
                            >
                                <FaSignOutAlt size={18} className=' ' />
                                <div>Logout</div>
                            </div>

                        </div>
                    </div>
                </div>



            </div>
        </>
    )
}

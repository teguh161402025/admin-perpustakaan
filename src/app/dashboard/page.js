'use client'
import withAuth from '@/context/WithAuth'
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { auth, db, storage } from '../../../firebase';
import { collection, doc, getCountFromServer, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion, count } from 'firebase/firestore'
import ToastComponent from '@/app/components/Toast';
import ModalBook from '../components/ModalBook';
const Home = () => {
    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');

    const [idBook, setIdBook] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        const getDataPeminjaman = async () => {
            try {
                const data = onSnapshot(
                    query(collection(db, 'peminjaman'), where('status', '==', 'Dipinjam')),
                    async (querySnapshot) => {
                        const peminjamanData = [];
                        const userDataPromises = [];

                        querySnapshot.forEach((doc) => {
                            const email = doc.data().email;
                            const userDataPromise = new Promise((resolve, reject) => {
                                onSnapshot(
                                    query(collection(db, 'User'), where('email', '==', email)),
                                    (userQuerySnapshot) => {
                                        userQuerySnapshot.forEach((doc2) => {
                                            peminjamanData.push({
                                                ...doc.data(),
                                                id: doc.id,
                                                phone: doc2.data().phone,
                                                address: doc2.data().address,
                                                name: doc2.data().name,
                                                grade: doc2.data().grade
                                            });
                                        });
                                        resolve();
                                    },
                                    (error) => {
                                        reject(error);
                                    }
                                );
                            });
                            userDataPromises.push(userDataPromise);
                        });

                        try {
                            await Promise.all(userDataPromises);
                            setDataPeminjaman(peminjamanData);
                        } catch (error) {
                            setError(error);
                            console.error("Error fetching data:", error);
                        }
                    },
                    (error) => {
                        setError(error);
                        console.error("Error fetching data:", error);
                    }
                );
            } catch (error) {
                setError(error);
                console.error("Error fetching data:", error);
            }
        };



        getDataPeminjaman();

    }, []);
    const getDataPeminjamanCount = async () => {

        const q = query(collection(db, 'peminjaman'), where('status', '==', 'Dipinjam'));
        try {
            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;

            return count;
        } catch (error) {
            console.error('Error counting documents:', error);
            return 0;
        }
    }

    const getDataBukuCount = async () => {

        const coll = collection(db, 'Books');
        try {
            const snapshot = await getCountFromServer(coll);
            return snapshot.data().count;
        } catch (error) {
            console.error('Error counting documents:', error);
            return 0;
        }
    }


    const getDataKonfirmasiCount = async () => {

        const q = query(collection(db, 'peminjaman'), where('status', '==', 'Menunggu Konfirmasi'));
        try {
            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;

            return count;
        } catch (error) {
            console.error('Error counting documents:', error);
            return 0;
        }
    }


    const getDataPerpanjanganCount = async () => {

        const q = query(collection(db, 'peminjaman'), where('status', '==', 'Menunggu Konfirmasi Perpanjangan'));
        try {
            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;

            return count;
        } catch (error) {
            console.error('Error counting documents:', error);
            return 0;
        }
    }
    function stringToDate(dateString) {
        return new Date(dateString);
    }
    function daysPassed(fromDate) {
        const today = new Date();


        today.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        // Hitung selisih waktu dalam milidetik
        const timeDifference = today - fromDate;

        // Konversi selisih waktu dari milidetik ke hari
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        return daysDifference;
    }

    // Fungsi untuk menghitung denda dan mengembalikan hasil dalam format rupiah
    function calculateFine(dateString) {
        const inputDate = stringToDate(dateString);
        const daysLate = daysPassed(inputDate);

        if (daysLate > 0) {
            const fine = daysLate * 2000;

            // Format hasil dalam rupiah
            return `Rp ${fine.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
        } else {
            return "Tidak ada denda";
        }
    }

    function isDatePassed(dateString) {
        const inputDate = stringToDate(dateString);
        const today = new Date();

        // Set jam, menit, detik, dan milidetik ke 0 untuk kedua tanggal agar perbandingan hanya pada bagian tanggal
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);

        return inputDate < today;
    }
    const statusTemplate = (data) => {
        if (isDatePassed(data.tenggat) == false) {
            return <div className='bg-green-200 py-2 text-center border border-green-500 text-sm text-green-500 px-8 w-44 rounded-full'>{data.status}</div>;
        }
        else {
            return <div className='bg-red-200 py-2 text-center border border-red-500 text-sm text-red-500 px-8 w-44 rounded-full'>Terlambat</div>;
        }

    };
    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const titleTemplate = (data) => {
        return <div onClick={() => { setIdBook(data.id_buku); openModal(); }} className='font-bold cursor-pointer text-blue-600 hover:transition-color duration-200 '>{data.judul}</div>

    };




    const header = (
        <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-semibold">Daftar Peminjaman</h5>
            <span className="relative">
                <i className="pi pi-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Cari..."
                    className="pl-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </span>
        </div>
    );

    return (
        <>
            {
                console.log(idBook)
            }
            <ToastComponent
                showToast={showToast}
                message={toastMessage}
                severity={toastSeverity}
            />
            {
                <ModalBook
                    id={idBook}
                    visible={modalVisible}
                    onClose={closeModal}
                />
            }

            <div className='flex flex-row w-full '>
                <div className='w-1/3 h-44 bg-blue-600 m-4 rounded-md  text-white p-4'>
                    <p className='text-md font-bold'>Buku </p>
                    <div className='text-sm font-semibold p-6 space-y-2'>
                        <div className='flex justify-between'>
                            <p className='text-md'>Total Buku</p>
                            <div>
                                {
                                    getDataBukuCount()
                                }
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <p className='text-sm'>Total Buku Dipinjam</p>
                            <div>
                                {
                                    getDataPeminjamanCount()
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-1/3 h-44 bg-lime-600 m-4 rounded-md  text-white p-4'>
                    <p className='text-md font-bold'>Notifikasi</p>
                    <div className='text-sm font-semibold p-6 space-y-2'>
                        <div className='flex justify-between'>
                            <p className='text-md'>Menunggu Konfirmasi Peminjaman</p>
                            <div>
                                {
                                    getDataKonfirmasiCount()
                                }

                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <p className='text-sm'>Menunggu Konfirmasi Perpanjangan</p>
                            <div>
                                {
                                    getDataPerpanjanganCount()
                                }
                            </div>
                        </div>

                    </div>
                </div>


                <div className='w-1/3 h-44 bg-red-600 m-4 rounded-md  text-white p-4'>
                    <p className='text-md font-bold'>Denda</p>
                    <div className='text-sm font-semibold p-6 space-y-2'>
                        <div className='flex justify-between'>
                            <p className='text-sm'>Total Keterlambatan</p>
                            <div>
                                {
                                    dataPeminjaman.filter(a => isDatePassed(a.tenggat) == true).length
                                }

                            </div>
                        </div>


                    </div>
                </div>

            </div>
            <div className="border border-gray-200 border-rounded rounded-md m-4 p-4">
                <DataTable
                    value={dataPeminjaman}
                    paginator
                    stripedRows
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilter={globalFilter}
                    header={header}
                    sortMode="multiple"

                >

                    <Column field="name" header="Peminjam" sortable className="font-semibold"></Column>
                    <Column field="grade" header="Kelas" sortable className="font-semibold"></Column>
                    <Column field="phone" header="telepon" sortable className="font-semibold"></Column>
                    <Column field="address" header="Alamat" sortable className="font-semibold"></Column>
                    <Column body={titleTemplate} header="Judul" sortable className="font-semibold"></Column>
                    <Column field="durasi" header="Durasi(hari)" sortable className="font-semibold"></Column>
                    <Column field="pengambilan" header="Tanggal Pengambilan" sortable className="font-semibold"></Column>
                    <Column field="tenggat" header="Batas Pengembalian" sortable className="font-semibold"></Column>
                    <Column body={statusTemplate} header="Status" sortable className="font-semibold"></Column>
                </DataTable>
            </div>
        </>
    )
}

export default withAuth(Home)
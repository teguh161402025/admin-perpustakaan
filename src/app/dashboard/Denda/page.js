'use client'
import withAuth from '@/context/WithAuth'
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { auth, db, storage } from '../../../../firebase';
import {
    collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot,
    deleteDoc, query, where, updateDoc, arrayUnion, increment
} from 'firebase/firestore'
import ToastComponent from '@/app/components/Toast';
import ModalBook from '../../components/ModalBook';
import { useForm, Controller } from 'react-hook-form';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

const Denda = () => {
    const toast = useRef(null);
    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');
    const [idBook, setIdBook] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [dendaNominal, setDendaNominal] = useState('');

    const { control, handleSubmit, setValue, formState: { errors } } = useForm();
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

        const getDendaNominal = async () => {

            const dendaRef = doc(db, 'denda', 'denda');


            const unsubscribe = onSnapshot(dendaRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setDendaNominal(data.nominal);
                    setValue('nominal', data.nominal);
                } else {
                    console.log("Dokumen tidak ditemukan!");
                }
            }, (error) => {
                console.error("Error mengambil data:", error);
            });

            return () => unsubscribe();

        }

        getDataPeminjaman();

        getDendaNominal();

    }, []);
    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }



    const handleConfirmation = async (id, id_book) => {

        const ref = doc(db, "peminjaman", id);
        try {
            await updateDoc(ref, {
                status: 'Telah Dikembalikan',

            });

            await updateDoc(doc(db, "Books", id_book), {
                stock: increment(+1)

            });
            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Denda Telah Dibayar' });


        } catch (error) {
            console.log(error.message);
        }
    }

    const confirmationTemplate = (data) => {
        return <div onClick={() => handleConfirmation(data.id, data.id_buku)} className='bg-red-500 py-2 text-center text-white px-8 cursor-pointer hover:transition-color hover:bg-red-700 transition ease-in-out duration-500 w-44 rounded-md'>Tandai Sudah DiBayar</div>;
    };


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
            const fine = daysLate * dendaNominal;
            const finerStr = `Rp ${fine.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
            // Format hasil dalam rupiah
            return { finerStr, daysLate };
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
    const fineTemplate = (data) => {
        return <div className='text-red-400 font-bold'>{calculateFine(data.tenggat).finerStr}</div>
    };
    const fineTemplatebyDay = (data) => {
        return <div className='text-red-400 font-bold'>{calculateFine(data.tenggat).daysLate}</div>
    };

    const headerConfirmation = (
        <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-semibold">Daftar Denda</h5>
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
    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const titleTemplate = (data) => {
        return <div onClick={() => { setIdBook(data.id_buku); openModal(); }} className='font-bold cursor-pointer text-blue-600 hover:transition-color duration-200 '>{data.judul}</div>

    };

    const onSubmit = async (data) => {
        try {

            const dendaRef = doc(db, 'denda', 'denda');
            await updateDoc(dendaRef, { nominal: data.nominal });
            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Nominal Denda Berhasil Diupdate' });
            console.log("Denda berhasil diupdate");
        } catch (error) {
            console.error("Error updating denda:", error);
        }
    };

    if (dendaNominal === null) {
        return <div>Loading...</div>;
    }
    return (
        <>
            {
                <Toast ref={toast} />
            }

            {
                <ModalBook
                    id={idBook}
                    visible={modalVisible}
                    onClose={closeModal}
                />
            }

            <div className='w-full p-4 '>
                <div className='bg-blue-600 text-white font-semibold rounded-md p-4 flex justify-between'>
                    <div className='p-4'>
                        <p>     Denda Saat Ini</p>
                        <div>
                            {
                                `Rp ${dendaNominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                            }/ hari
                        </div>

                    </div>


                    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                        <div className="mb-4">
                            <label htmlFor="nominal" className="block mb-2">Nominal Denda</label>
                            <Controller
                                name="nominal"
                                control={control}
                                rules={{ required: 'Nominal denda wajib diisi' }}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputNumber
                                            id={field.name}
                                            value={field.value}
                                            onValueChange={(e) => field.onChange(e.value)}
                                            mode="currency"
                                            currency="IDR"
                                            locale="id-ID"
                                            className="w-full border p-2 border-gray-400 text-black"
                                        />
                                        {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                    </>
                                )}
                            />
                        </div>
                        <Button type="submit" label="Update Denda" className="p-button-primary bg-green-600 p-2" />
                    </form>
                </div>

            </div>
            <div className="border border-blue-300 border-rounded rounded-md m-4 p-4">
                <DataTable
                    value={dataPeminjaman.filter(a => isDatePassed(a.tenggat) == true)}
                    paginator
                    stripedRows
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilter={globalFilter}
                    header={headerConfirmation}
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
                    <Column header="Jumlah Hari yang Lewat" body={fineTemplatebyDay}></Column>
                    <Column header="Nominal Denda" body={fineTemplate}></Column>
                    <Column header="Pesetujuan" body={confirmationTemplate}></Column>
                </DataTable>
            </div>


        </>
    )
}

export default withAuth(Denda)


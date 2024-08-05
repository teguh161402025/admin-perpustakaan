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
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from "primereact/floatlabel";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
const Confirmation = () => {
    const toast = useRef(null);
    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');
    const [idBook, setIdBook] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [id, setId] = useState('');
    const [visible, setVisible] = useState(false);
    const [reason, setReason] = useState('');
    useEffect(() => {
        const getDataPeminjaman = async () => {
            try {
                const data = onSnapshot(
                    query(collection(db, 'peminjaman'), where('status', 'in', ['Menunggu Konfirmasi', 'Menunggu Konfirmasi Perpanjangan'])),
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
    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }


    function getDate7DaysFromNow(a) {
        const today = new Date();
        today.setDate(today.getDate() + a);
        const year = today.getFullYear();
        const month = padZero(today.getMonth() + 1);
        const day = padZero(today.getDate());

        return `${year}-${month}-${day}`;
    }
    function getCurrentDateString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so we add 1
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    const handleConfirmation = async (id, durasi, id_book) => {
        const tenggat = getDate7DaysFromNow(durasi);

        const ref = doc(db, "peminjaman", id);
        try {
            await updateDoc(ref, {
                status: 'Disetujui',
                tenggat: tenggat,
                pengambilan: getCurrentDateString()

            });
            await updateDoc(doc(db, "Books", id_book), {
                stock: increment(-1)

            });


        } catch (error) {
            console.log(error.message);
        }

        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Peminjaman Telah Dikonfirmasi' });

        console.log(showToast)
    }

    const handleTolak = async () => {
        const ref = doc(db, "peminjaman", id.id);
        try {
            if (id.status == 'Menunggu Konfirmasi Perpanjangan') {
                await updateDoc(ref, {
                    status_ditolak: 'Ditolak',
                    alasan: reason,
                    status: 'Dipinjam'


                });
            }
            else {
                await updateDoc(ref, {
                    status_ditolak: 'Ditolak',
                    alasan: reason,


                });
            }


            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Peminjaman Telah Ditolak' });

        } catch (error) {
            console.log(error.message);
        }
    }

    const confirmationTemplate = (data) => {
        return <div className='flex space-x-4'>
            <div onClick={() => handleConfirmation(data.id, data.durasi, data.id_buku)} className='bg-blue-500 py-2 text-center text-white px-8 cursor-pointer hover:transition-color hover:bg-blue-700 transition ease-in-out duration-500 w-44 rounded-md'>Konfirmasi</div>
            <div onClick={() => { setVisible(true); setId({ id: data.id, status: data.status }) }} className='bg-red-500 py-2 text-center text-white px-8 cursor-pointer hover:transition-color hover:bg-red-700 transition ease-in-out duration-500 w-44 rounded-md'>Tolak</div>
        </div>;
    };
    const header = (
        <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-semibold">Daftar Menunggu Pengambilan Buku</h5>
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
    const footerContent = (
        <div className='space-x-4'>
            <button onClick={() => { setVisible(false); handleTolak() }} className="text-md font-bold text-white rounded-full py-2 px-6 bg-blue-600 
            hover:bg-blue-800 hover:transition-color duration-200 " disabled={isLoading} >{isLoading ? 'Loading...' : 'Submit'}</button>
            <button className="text-md font-bold text-blue-600 rounded-full py-2 px-6 bg-white
            hover:bg-gray-300 hover:transition-color duration-200 border border-blue-600"disabled={isLoading} onClick={() => setVisible(false)} autoFocus >Cancel</button>
        </div>
    );
    const statusTemplate = (data) => {
        if (data.status == 'Menunggu Konfirmasi') {
            return <div className='bg-blue-200 py-2 text-center border border-blue-500 text-sm text-blue-500 px-8 w-44 rounded-full'>{data.status}</div>;
        }
        else {
            return <div className='bg-orange-200 py-2 text-center border border-orange-500 text-sm text-orange-500 px-8 w-44 rounded-full'>{data.status}</div>;
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


    return (
        <>{
            <Toast ref={toast} />
        }

            {
                <ModalBook
                    id={idBook}
                    visible={modalVisible}
                    onClose={closeModal}
                />
            }


            <div className="border border-blue-300 border-rounded rounded-md m-4 p-4">
                <DataTable
                    value={dataPeminjaman.filter(a => a.status_ditolak != 'Ditolak')}
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
                    <Column body={statusTemplate} header="status" sortable className="font-semibold"></Column>
                    <Column header="Pesetujuan" body={confirmationTemplate}></Column>
                </DataTable>
                <Dialog header="Berikan Alasan Penolakan" footer={footerContent} visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }}>
                    <div className="card flex justify-content-center m-6">
                        <FloatLabel>
                            <InputTextarea className='border border-gray-200 w-full p-2' id="description" value={reason} onChange={(e) => setReason(e.target.value)} rows={5} cols={120} />
                            <label htmlFor="description">Alasan Penolakan</label>
                        </FloatLabel>
                    </div>
                </Dialog>

            </div>


        </>
    )
}

export default withAuth(Confirmation)
'use client'
import withAuth from '@/context/WithAuth'
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { auth, db, storage } from '../../../../firebase';
import { collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
import Image from 'next/image'
import Spinner from '@/app/components/Spinner';
import ToastComponent from '@/app/components/Toast';
import Link from 'next/link';
const Books = () => {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');
    useEffect(() => {
        const getData = async () => {
            try {
                const data = onSnapshot(
                    collection(db, "Books"),
                    (querySnapshot) => {
                        const data = [];
                        querySnapshot.forEach((doc) => {
                            data.push({ ...doc.data(), id: doc.id });
                        });
                        setData(data);
                        setIsLoading(false)
                    },
                    (error) => {
                        setError(error);
                        console.error("Error fetching data:", error);
                        setIsLoading(false);
                    }
                );

                // Cleanup function untuk membatalkan subscription
                return data;
            } catch (error) {
                setError(error);
                console.error("Error fetching data:", error);

            }
        }

        getData();

    }, []);

    console.log(data);
    const deleteBook = async (id) => {
        try {


            await deleteDoc(doc(db, "Books", id));
            setShowToast(true);
            setToastMessage('Berhasil Menghapus');

        }
        catch (error) {
            console.log(error.message);
        }
    }
    const imageBodyTemplate = (data) => {
        return <Image src={data.image} alt={data.name} width={120} height={120} className="shadow-md shadow-2 border-round" />;
    };
    const deleteEditTempalate = (data) => {
        return <div className='flex p-2 space-x-4 text-white'>
            <Link href={{
                pathname: '/dashboard/EditBook',
                query: {
                    search: data.id,
                },
            }} query><div className='py-2 px-6 cursor-pointer bg-blue-800 hover:transition-color transition ease-in-out hover:bg-blue-950 duration-75   bg-blue-850'>Edit</div></Link>
            <div onClick={() => deleteBook(data.id)} className='py-2 px-6 cursor-pointer bg-red-500 hover:transition-color transition ease-in-out hover:bg-red-600 duration-75   bg-blue-850'>Hapus</div>

        </div>;
    };
    const header = (
        <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-semibold">Daftar Buku</h5>
            <span className="relative">
                <i className="pi pi-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Cari..."
                    className="pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </span>
        </div>
    );

    return (

        isLoading ?
            <Spinner /> // Tampilkan spinner saat sedang memuat data
            :
            <div className="m-4 p-2 border-[1px] border-lime-300 rounded-md">
                <ToastComponent
                    showToast={showToast}
                    message={toastMessage}
                    severity={toastSeverity}
                />
                <DataTable
                    value={data}
                    paginator
                    showGridlines
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilter={globalFilter}
                    header={header}
                    sortMode="multiple"

                >
                    <Column field="title" header="Judul" sortable className="font-semibold"></Column>
                    <Column field="category" header="Kategori" sortable className="font-semibold"></Column>
                    <Column field="description" header="Deskripsi" sortable className="font-semibold"></Column>
                    <Column field="releaseDate" header="Tanggal Rilis" sortable className="font-semibold"></Column>
                    <Column field="author" header="Pengarang" sortable className="font-semibold"></Column>
                    <Column field="publisher" header="Penerbit" sortable className="font-semibold"></Column>
                    <Column field="stock" header="Tersedia" sortable className="font-semibold"></Column>
                    <Column header="Sampul" body={imageBodyTemplate}></Column>
                    <Column header="Aksi" body={deleteEditTempalate}></Column>
                </DataTable>
            </div>
    )
}

export default withAuth(Books)
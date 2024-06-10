'use client'
import withAuth from '@/context/WithAuth'
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { auth, db, storage } from '../../../../firebase';
import { collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
import ToastComponent from '@/app/components/Toast';
import ModalBook from '../../components/ModalBook';
import { Dropdown } from 'primereact/dropdown';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const History = () => {
    const formatTanggalSekarang = () => {
        // Buat objek Date baru untuk tanggal saat ini
        const sekarang = new Date();

        // Array nama-nama bulan dalam Bahasa Indonesia
        const bulanIndonesia = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        // Ambil bulan (dari 0 sampai 11) dan tahun
        const bulan = sekarang.getMonth(); // getMonth() mengembalikan bulan dalam rentang 0-11
        const tahun = sekarang.getFullYear(); // getFullYear() mengembalikan tahun saat ini

        // Gabungkan bulan dan tahun dalam format "Bulan Tahun"
        return `${bulanIndonesia[bulan]} ${tahun}`;
    };

    const formatTanggalSekarangSelect = () => {
        // Buat objek Date baru untuk tanggal saat ini
        const sekarang = new Date();

        // Ambil bulan (dari 0 sampai 11) dan tahun
        const bulan = sekarang.getMonth() + 1; // getMonth() mengembalikan bulan dalam rentang 0-11, jadi tambahkan 1
        const tahun = sekarang.getFullYear(); // getFullYear() mengembalikan tahun saat ini

        // Format bulan agar selalu dua digit
        const bulanFormatted = bulan < 10 ? `0${bulan}` : bulan;

        // Gabungkan tahun dan bulan dalam format "YYYY-MM"
        return `${tahun}-${bulanFormatted}`;
    };
    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');
    const [selectedMonth, setSelectedMonth] = useState(formatTanggalSekarangSelect());
    const [idBook, setIdBook] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        const getDataPeminjaman = async () => {
            try {
                const data = onSnapshot(
                    query(collection(db, 'peminjaman'), where('status', '==', 'Telah Dikembalikan')),
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

    const generatePDF = () => {
        const doc = new jsPDF();
        const filteredData = dataPeminjaman.filter(filterByMonth);

        // Judul PDF
        const title = selectedMonth
            ? `Daftar Peminjaman - ${new Date(selectedMonth + '-01').toLocaleString('id-ID', { year: 'numeric', month: 'long' })}`
            : 'Daftar Peminjaman ' + formatTanggalSekarang();
        doc.text(title, 14, 10);

        // Tabel
        const columns = [
            { header: 'Peminjam', dataKey: 'name' },
            { header: 'Kelas', dataKey: 'grade' },
            { header: 'Telepon', dataKey: 'phone' },
            { header: 'Alamat', dataKey: 'address' },
            { header: 'Judul', dataKey: 'judul' },
            { header: 'Durasi (hari)', dataKey: 'durasi' },
            { header: 'Tanggal Pengambilan', dataKey: 'pengambilan' },
            { header: 'Batas Pengembalian', dataKey: 'tenggat' },
        ];

        const rows = filteredData.map(item => ({
            ...item,
            judul: item.judul // Asumsikan 'judul' tersedia di setiap item
        }));

        doc.autoTable({
            startY: 20,
            head: [columns.map(col => col.header)],
            body: rows.map(row => columns.map(col => row[col.dataKey] || '')),
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 15 },
                2: { cellWidth: 20 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 15 },
                6: { cellWidth: 25 },
                7: { cellWidth: 25 },
            }
        });

        // Unduh PDF
        const pdfName =
            `peminjaman_${selectedMonth}.pdf`

        doc.save(pdfName);
    };

    // Fungsi untuk menghitung denda dan mengembalikan hasil dalam format rupiah

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const titleTemplate = (data) => {
        return <div onClick={() => { setIdBook(data.id_buku); openModal(); }} className='font-bold cursor-pointer text-blue-600 hover:transition-color duration-200 '>{data.judul}</div>

    };
    const getUniqueMonths = () => {
        const months = dataPeminjaman.map(item => {
            const date = new Date(item.pengambilan);
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        });
        return [...new Set(months)].map(month => ({
            label: new Date(month + '-01').toLocaleString('id-ID', { year: 'numeric', month: 'long' }),
            value: month
        }));
    };

    const filterByMonth = (data) => {
        if (!selectedMonth) return true;
        const date = new Date(data.tenggat);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        return month === selectedMonth;
    };

    const header = (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <h5 className="text-lg font-semibold mr-4">Daftar Peminjaman {formatTanggalSekarang()}</h5>
                <button
                    onClick={generatePDF}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Unduh PDF
                </button>
            </div>
            <div className="flex items-center">
                <Dropdown
                    value={selectedMonth}
                    options={getUniqueMonths()}
                    onChange={(e) => setSelectedMonth(e.value)}
                    placeholder="Pilih Bulan"
                    className="mr-4"
                />
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
            <div className="border border-gray-200 border-rounded rounded-md m-4 p-4">
                <DataTable
                    value={dataPeminjaman.filter(filterByMonth)}
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

                </DataTable>
            </div>
        </>
    )
}

export default withAuth(History)
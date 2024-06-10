'use client'
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../../../firebase';
import withAuth from '@/context/WithAuth';
import ToastComponent from '@/app/components/Toast';
import Spinner from '@/app/components/Spinner';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

const Addbook = () => {
    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm();
    const [imageBase64, setImageBase64] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');

    const onSubmit = async (data) => {
        const timestamp = new Date(data.releaseDate);
        const year = timestamp.getFullYear();
        const month = String(timestamp.getMonth() + 1).padStart(2, '0'); // Bulan di JavaScript dimulai dari 0
        const day = String(timestamp.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const formData = { ...data, image: imageBase64, releaseDate: formattedDate, stock: parseInt(data.stock, 10) };
        const docRef = collection(db, "Books");
        setIsLoading(true);
        try {
            await addDoc(docRef, {
                ...formData
            });

            setShowToast(true);
            setToastMessage('Berhasil Menambahkan Buku');
            reset();
        } catch (error) {
            console.log(error.message);
        } finally {
            setIsLoading(false);
            reset();
        }
        console.log(formData);
    };

    const handleImageChange = (event) => {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageBase64('');
        }
    };

    return (
        <div>
            <ToastComponent
                showToast={showToast}
                message={toastMessage}
                severity={toastSeverity}
            />
            <div className=" m-4">
                <h2 className="text-2xl font-bold mb-4 text-blue-950">Tambah Buku</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full p-6 bg-white rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
                            Judul Buku
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: 'Judul buku wajib diisi' }}
                            render={({ field }) => (
                                <InputText
                                    id="title"
                                    {...field}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.title && <span className="text-red-500">{errors.title.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="category" className="block text-gray-700 font-bold mb-2">
                            Kategori
                        </label>
                        <Controller
                            name="category"
                            control={control}
                            rules={{ required: 'Kategori wajib dipilih' }}
                            render={({ field }) => (
                                <Dropdown
                                    id="category"
                                    {...field}
                                    options={['novel', 'komik', 'referensi', 'biografi', 'sejarah', 'sains', 'teknologi', 'sastra', 'pendidikan', 'anak']}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.category && <span className="text-red-500">{errors.category.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                            Keterangan
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: 'Keterangan wajib diisi' }}
                            render={({ field }) => (
                                <InputTextarea
                                    id="description"
                                    {...field}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="image" className="block text-gray-700 font-bold mb-2">
                            Gambar
                        </label>
                        <FileUpload
                            id="image"
                            name="image"
                            accept="image/*"
                            onSelect={handleImageChange}
                            multiple={false}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                        {errors.image && <span className="text-red-500">{errors.image.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="author" className="block text-gray-700 font-bold mb-2">
                            Pengarang
                        </label>
                        <Controller
                            name="author"
                            control={control}
                            rules={{ required: 'Pengarang wajib diisi' }}
                            render={({ field }) => (
                                <InputText
                                    id="author"
                                    {...field}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.author && <span className="text-red-500">{errors.author.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="synopsis" className="block text-gray-700 font-bold mb-2">
                            Sinopsis
                        </label>
                        <Controller
                            name="synopsis"
                            control={control}
                            rules={{ required: 'Sinopsis wajib diisi' }}
                            render={({ field }) => (
                                <InputTextarea
                                    id="synopsis"
                                    {...field}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.synopsis && <span className="text-red-500">{errors.synopsis.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="stock" className="block text-gray-700 font-bold mb-2">
                            Stok
                        </label>
                        <Controller
                            name="stock"
                            control={control}
                            rules={{ required: 'Stok wajib diisi', min: { value: 0, message: 'Stok tidak boleh negatif' } }}
                            render={({ field }) => (
                                <InputText
                                    id="stock"
                                    type="number"
                                    {...field}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.stock && <span className="text-red-500">{errors.stock.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="publisher" className="block text-gray-700 font-bold mb-2">
                            Penerbit
                        </label>
                        <Controller
                            name="publisher"
                            control={control}
                            rules={{ required: 'Penerbit wajib diisi' }}
                            render={({ field }) => (
                                <InputText
                                    id="publisher"
                                    {...field}
                                    className="w-full bg-gray-100 p-2 border border-gray-300"
                                />
                            )}
                        />
                        {errors.publisher && <span className="text-red-500">{errors.publisher.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="releaseDate" className="block text-gray-700 font-bold mb-2">
                            Tanggal Rilis
                        </label>
                        <Controller
                            name="releaseDate"
                            control={control}
                            rules={{ required: 'Tanggal rilis wajib diisi' }}
                            render={({ field }) => (
                                <Calendar
                                    id="releaseDate"
                                    {...field}
                                    dateFormat="yy-mm-dd"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            )}
                        />
                        {errors.releaseDate && <span className="text-red-500">{errors.releaseDate.message}</span>}
                    </div>

                    <Button
                        type="submit"
                        label={isLoading ? 'Loading...' : 'Submit'}
                        disabled={isLoading}
                        className="bg-white text-blue-950 font-bold py-2 px-4 rounded-lg border-2 border-blue-950 hover:bg-gray-200"
                    />
                </form>
            </div>
        </div>
    )
}

export default withAuth(Addbook)
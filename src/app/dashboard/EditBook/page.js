'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../../../firebase';
import withAuth from '@/context/WithAuth';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import Spinner from '@/app/components/Spinner';
import { useSearchParams } from 'next/navigation'
const EditBook = () => {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm();
    const [imageBase64, setImageBase64] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const toast = useRef(null);
    const searchParams = useSearchParams()
    useEffect(() => {

        const fetchBookData = async () => {


            const search = searchParams.get('search')
            console.log(search)
            try {
                setIsLoading(true); // Set isLoading menjadi true sebelum memulai fetch data

                const docRef = doc(db, "Books", search);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const bookData = { ...docSnap.data(), id: docSnap.id };


                    setValue("title", bookData.title);
                    setValue("category", bookData.category);
                    setValue("description", bookData.description);
                    setImageBase64(bookData.image);
                    setValue("author", bookData.author);
                    setValue("synopsis", bookData.synopsis);
                    setValue("stock", bookData.stock);
                    setValue("publisher", bookData.publisher);
                    setValue("releaseDate", bookData.releaseDate);
                    console.log(JSON.stringify(bookData));


                } else {
                    console.log("Document not found!");
                }

                setIsLoading(false);

            } catch (error) {
                console.error("Error fetching book data:", error);
                // Tambahkan logika untuk menangani kesalahan, misalnya menampilkan pesan kesalahan
            } finally {
                setIsLoading(false); // Set isLoading menjadi false setelah proses selesai, baik sukses atau gagal
            }
        };

        fetchBookData();
    }, [setValue]);

    const onSubmit = async (data) => {

        const search = searchParams.get('search')
        const formData = { ...data, image: imageBase64 };
        const bookRef = doc(db, "Books", search);
        setIsLoading(true);
        try {
            await updateDoc(bookRef, formData);
            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Buku berhasil diperbarui', life: 3000 });

        } catch (error) {
            console.log(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleImageChange = (event) => {
        const file = event.target.files[0];
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

    const categoryOptions = [
        { label: 'Novel', value: 'novel' },
        { label: 'Komik', value: 'komik' },
        { label: 'Referensi', value: 'referensi' },
        { label: 'Biografi', value: 'biografi' },
        { label: 'Sejarah', value: 'sejarah' },
        { label: 'Sains', value: 'sains' },
        { label: 'Teknologi', value: 'teknologi' },
        { label: 'Sastra', value: 'sastra' },
        { label: 'Pendidikan', value: 'pendidikan' },
        { label: 'Anak', value: 'anak' },
    ];

    return (
        <div>
            {
                isLoading && <Spinner />
            }
            <Toast ref={toast} />
            <div className=" m-6">
                <h2 className="text-2xl font-bold mb-4 text-blue-950">Edit Buku</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full p-6 bg-white rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
                            Judul Buku
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: 'Judul buku wajib diisi' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputText id={field.name} {...field} className="w-full border p-2 border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="category" className="block text-gray-700 font-bold mb-2">
                            Kategori
                        </label>
                        <Controller
                            name="category"
                            control={control}
                            rules={{ required: 'Kategori wajib dipilih' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <Dropdown id={field.name} {...field} options={categoryOptions} placeholder="Pilih Kategori" className="w-full border border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                            Keterangan
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: 'Keterangan wajib diisi' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputTextarea id={field.name} {...field} className="w-full border p-2 border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="image" className="block text-gray-700 font-bold mb-2">
                            Gambar
                        </label>
                        {imageBase64 && (
                            <div className="mb-4">
                                <Image src={imageBase64} alt="Book Image" width="200" preview />
                            </div>
                        )}
                        <input type='file' name="image" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-white  border border-gray-300 rounded-lg cursor-pointer bg-gray-50focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-md file:font-semibold file:bg-blue-950 file:m-4 file:text-white hover:file:bg-blue-600 file:cursor-pointer" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="author" className="block text-gray-700 font-bold mb-2">
                            Pengarang
                        </label>
                        <Controller
                            name="author"
                            control={control}
                            rules={{ required: 'Pengarang wajib diisi' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputText id={field.name} {...field} className="w-full border p-2 border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="synopsis" className="block text-gray-700 font-bold mb-2">
                            Sinopsis
                        </label>
                        <Controller
                            name="synopsis"
                            control={control}
                            rules={{ required: 'Sinopsis wajib diisi' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputTextarea id={field.name} {...field} className="w-full border p-2 border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="stock" className="block text-gray-700 font-bold mb-2">
                            Stok
                        </label>
                        <Controller
                            name="stock"
                            control={control}
                            rules={{ required: 'Stok wajib diisi', min: { value: 0, message: 'Stok tidak boleh negatif' } }}
                            render={({ field, fieldState }) => (
                                <>
                                    <input type="number" id={field.name} {...field} className="w-full border p-2 border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="publisher" className="block text-gray-700 font-bold mb-2">
                            Penerbit
                        </label>
                        <Controller
                            name="publisher"
                            control={control}
                            rules={{ required: 'Penerbit wajib diisi' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputText id={field.name} {...field} className="w-full border p-2 border-gray-400" />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="releaseDate" className="block text-gray-700 font-bold mb-2">
                            Tahun Rilis
                        </label>
                        <Controller
                            name="releaseDate"
                            control={control}
                            rules={{ required: 'Tahun rilis wajib diisi' }}
                            render={({ field, fieldState }) => (
                                <>
                                    <input
                                        type="number"
                                        id={field.name}
                                        {...field}
                                        min={1900}
                                        max={2100}
                                        className="w-full border p-2 border-gray-400"
                                        required // Menambahkan atribut required untuk mencegah nilai kosong
                                    />
                                    {fieldState.error && <span className="text-red-500">{fieldState.error.message}</span>}
                                </>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        label={isLoading ? 'Loading...' : 'Update'}
                        className="bg-blue-950 p-4 px-10 text-white hover:transition-color hover:bg-gray-600 transitiion ease-in-out hover:duration-75"
                        disabled={isLoading}
                    />
                </form>
            </div>
        </div>
    )
}

export default withAuth(EditBook);
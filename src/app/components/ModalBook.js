import React, { useState, useEffect } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Spinner from "./Spinner";
import Image from "next/image";
import { auth, db, storage } from '../../../firebase';
import { collection, doc, getDocs, setDoc, getDoc, addDoc, onSnapshot, deleteDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
const ModalBook = ({ id, visible, onClose }) => {
    const [book, setBook] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, "Books", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { ...docSnap.data(), id: docSnap.id };
                    setBook(data);
                } else {
                    console.log("Document not found!");
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        };

        if (id) {
            getData();
            console.log(id)
        }


    }, [id]);
    return (
        <Dialog header="Header" visible={visible} style={{ width: '70vw' }} onHide={onClose}>
            {
                isLoading && <Spinner />
            }
            <div className="flex justify-center">
                <div className="mw-full mx-12 p-4 bg-white shadow-md rounded-lg overflow-hidden m-4">
                    <div className="flex space-x-2">
                        <Image src={book.image} height={200} width={200} />
                        <div className="space-y-2 p-4">
                            <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
                            <p className="text-gray-600">{book.author}</p>
                            <p className="text-gray-600 italic">{book.category}</p>
                            <p className="text-gray-600 mt-2"><strong>Publisher:</strong> {book.publisher}</p>
                            <p className="text-gray-600 mt-2"><strong>Release Date:</strong> {book.releaseDate}</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="mt-2">
                            <label ><strong>Deskripsi:</strong></label>
                            <p className="text-gray-600 ">{book.description}</p>
                        </div>

                        <div className="mt-4">
                            <label ><strong>Synopsis:</strong></label>

                            <p className="text-gray-600 "> {book.synopsis}</p>
                        </div>

                    </div>
                </div>
            </div>

        </Dialog >
    )
}

export default ModalBook
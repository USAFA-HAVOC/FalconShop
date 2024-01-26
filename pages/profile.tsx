import React, {useEffect, useState} from 'react';
import RootLayout from '@/components/RootLayout';
import '../firebase';
import ItemUpload from "@/components/ItemUpload";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import Listings from "@/components/Listings";
import Image from "next/image";
import {getDocs} from "@firebase/firestore";
import {collection} from "firebase/firestore";
import {db} from "@/firebase";
import {CadetItem} from "@/components/Listings";


export default function Profile() {
    const auth = getAuth();
    const user = auth.currentUser;
    let umail = "jdoe@example.com"

    if(user != null && user.email != null){
        umail = user.email
    }

    const [items, setItems] = useState<CadetItem[]>([]);
    const [validImageUrls, setvalidImageUrls] = useState<string[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setvalidImageUrls(await Promise.all(items.map(async (item) => {
                try {
                    const response = await fetch(item.imageUrl, { method: 'HEAD' });
                    return response.ok ? item.imageUrl : '';
                } catch {
                    return '';
                }
            })))
        })();
    }, [items]);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid); // Set the current user ID
            }
        });
    }, []);

    useEffect(() => {
        const getItems = async () => {
            const fetchedItems: CadetItem[] = [];
            const querySnapshot = await getDocs(collection(db, 'cadetItems'));
            querySnapshot.forEach((docSnapshot) => {
                fetchedItems.push({
                    ...docSnapshot.data() as CadetItem,
                });
            });

            // Filter items by the current user ID
            const userItems = fetchedItems.filter(item => item.createdBy === currentUserId);

            console.log("Filtered items for current user:", userItems);
            setItems(userItems);
        }

        // Fetch items only if there is a logged-in user
        if (currentUserId) {
            getItems();
        }
    }, [currentUserId]);

    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-center p-24 bg-gray-100">
                <div
                    className="z-10 max-w-5xl w-full items-center justify-between font-mono text-lg lg:center text-black">

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">User Information</h2>
                        <div className="flex items-center">
                            <div>
                                <p><strong>Email:</strong> {umail} </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Upload a Product</h2>
                        <ItemUpload/>
                    </section>

                    <section className="pt-12">
                        <h2 className="text-2xl font-bold mb-4">Your Listings</h2>
                        <div className="mb-32 grid mx-auto gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl w-full">

                            {items.map((item) => (
                                <div key={item.id}
                                     className="rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-100 dark:border-neutral-700 dark:bg-neutral-800/30 p-6 shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105">
                                    {currentUserId === item.createdBy && (
                                        <p className ="block mt-2 font-bold text-red-700 mb-0">  Your Listing </p>
                                    )}
                                    <h2 className="card-title-font mb-3 text-xl text-blue-600">{item.title}</h2>
                                    <p className="card-body-font opacity-70 mb-3">
                                        {item.description}
                                    </p>
                                    <span className="block mt-2 font-bold text-blue-700">${item.price}</span>
                                    <p className="mt-3 text-gray-600">Cadet: {item.cadetName}</p>
                                    <p className="mt-1 text-gray-600">Contact: {item.cadetContact}</p>
                                    <Image
                                        src={item.imageUrl}
                                        alt=""
                                        width={600}
                                        height={400}
                                        loader={({src}) => src}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </RootLayout>
    );
}
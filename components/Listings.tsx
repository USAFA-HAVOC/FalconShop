import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/firebase';
import { collection, getDocs, query, where, limit, orderBy, QueryConstraint } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import InfiniteScroll from 'react-infinite-scroll-component';

export interface CadetItem {
    createdBy: any;
    timeCreated: any;
    id: string;
    title: string;
    description: string;
    category: string;
    price: string;
    cadetName: string;
    cadetContact: string;
    imageUrl: string;
}

interface ListingsProps {
    selectedCategories: string[];
    searchValue: string;
}

const buildQuery = (selectedCategories: string[]): QueryConstraint[] => {
    let constraints: QueryConstraint[] = [orderBy('createdBy')];

    if (selectedCategories.length > 0) {
        constraints.push(where('category', 'in', selectedCategories));
    }

    constraints.push();

    return constraints;
};

export default function Listings({ selectedCategories, searchValue }: ListingsProps) {
    const [items, setItems] = useState<CadetItem[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
        });
    }, []);

    useEffect(() => {
        const cacheKey = `cadetItemsCache-${selectedCategories.join('-')}-${searchValue}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        const fetchData = async () => {
            const q = query(collection(db, 'cadetItems'), ...buildQuery(selectedCategories));
            const querySnapshot = await getDocs(q);

            let fetchedItems: CadetItem[] = querySnapshot.docs.map(doc => ({
                ...doc.data() as CadetItem,
                id: doc.id,
            }));

            // Client-side filtering based on category selection and search value
            const filteredItems = fetchedItems.filter((item: CadetItem) =>
                (searchValue === '' || item.title.toLowerCase().includes(searchValue.toLowerCase()))
            );
            
            setItems(filteredItems);
            sessionStorage.setItem(cacheKey, JSON.stringify(fetchedItems));
        };

        if (cachedData) {
            setItems(JSON.parse(cachedData));
            console.log('Loaded from cache');
            console.log('Cached key:', cacheKey);
            console.log('Cached data:', JSON.parse(cachedData));
            return;
        } else {
            console.log('Loaded from db');
            console.log('Items:', items);
            fetchData();
        }
    }, [selectedCategories, searchValue]);

    return (
        currentUserId ?
            <section className="flex flex-col items-center justify-center">

                <InfiniteScroll
                    dataLength={items.length}
                    next={() => {setItems}}
                    hasMore={false}
                    loader={<h4 className="text-gray-500 text-sm mb-4">loading more items...</h4>}
                    endMessage={
                        <p style={{textAlign: 'center'}}>
                            <b className="text-gray-500 text-sm mb-6">You{`'`}ve reached the end!</b>
                        </p>
                    }
                    className={"p-8"}
                >
                    <div className="mb-32 grid mx-auto gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                        <div className="card">
                            <h2 className="card-title-font mb-3 text-xl w-full overflow-wrap-anywhere break-words">Example</h2>
                            <span
                                className="block mt-2 font-bold text-blue-700 overflow-wrap-anywhere break-words">Example</span>
                            <p className="card-body-font mt-3 text-gray-600 overflow-wrap-anywhere break-words">Cadet:
                                Example</p>
                            <p className="card-body-font mt-1 text-gray-600 overflow-wrap-anywhere break-words">Contact:
                                Example</p>
                            <p className="card-desc-font opacity-70 mb-3 overflow-wrap-anywhere break-words">Example</p>

                            <Image
                                src={"/assets/images/spark.png"}
                                alt=""
                                width={150}
                                height={150}
                                loader={({src}) => src}
                            />
                        </div>

                        {items.map((item) => (
                            <div key={item.id} className="card">
                                {currentUserId === item.createdBy && (
                                    <p className="block mt-2 font-bold text-red-700 mb-0">Your Listing</p>
                                )}
                                <h2 className="card-title-font mb-3 text-xl w-full overflow-wrap-anywhere break-words">{item.title}</h2>
                                <span
                                    className="block mt-2 font-bold text-blue-700 overflow-wrap-anywhere break-words">${item.price}</span>
                                <p className="card-body-font mt-3 text-gray-600 overflow-wrap-anywhere break-words">Cadet: {item.cadetName}</p>
                                <p className="card-body-font mt-1 text-gray-600 overflow-wrap-anywhere break-words">Contact: {item.cadetContact}</p>
                                <p className="card-desc-font opacity-70 mb-3 overflow-wrap-anywhere break-words">{item.description}</p>
                                <Image
                                    src={item.imageUrl}
                                    alt=""
                                    width={150}
                                    height={150}
                                    loader={({src}) => src}
                                />
                            </div>
                        ))}
                    </div>
                </InfiniteScroll>


            </section>
            :
            <div className="flex justify-center h-screen">
                <p className="text-center text-2xl text-blue-500">Please login with AFACADEMY email to view listings</p>
            </div>
    );
}
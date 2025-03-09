"use client";
import React, {useState, useEffect, useMemo} from "react";
import styles from "./Auctions.module.scss";
import {RootState, useAppSelector} from "@/app/redux/store";
import Lot from "@/components/Lot/Lot";
import Select from "@/components/ui/Select/Select";
// =================================


const New: React.FC = () => {
    const auctions = useAppSelector((state) => state.auctions.auctions);

// =================================
    const selectItems = [
        {name: "Newest First", value: "desc"},
        {name: "Oldest First", value: "asc"},
    ] as const;
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

// =================================
    const sortPostsByDate = (auctions, sortOrder) => {
        console.log("===sortOrder===", sortOrder)
        auctions.map((l) => {
            console.log(l.createdAt)
        })
        const newAuctions = [...auctions]
        return newAuctions.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            if (sortOrder === "asc") {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
    };
// =========== Функция для изменения порядка сортировки по дате
    const handleSortOrderChange = (e) => {
        setSortOrder(e.target.value); // Устанавливаем сортировку по дате (asc/desc)
    };
    const currentAuctions = useMemo(() => {
        const sortedPosts = sortPostsByDate(auctions, sortOrder);
        return sortedPosts;
    }, [
        auctions,
        sortOrder]);
// =================================


    return (
        <div>
            <h2 className="text-2xl font-semibold italic text-gray-800 text-center">
                Auction List
            </h2>
            {/* Сортировка по дате создания*/}
            <div className="flex gap-2 items-center">
                <h3 className="italic">Sort by Date:</h3>
                <Select setSortOrder={setSortOrder} selectItems={selectItems}/>
            </div>
            <ul className="mt-4 flex flex-col gap-4">
                {currentAuctions.length > 0 ? (
                    currentAuctions.map((auction) => <Lot key={auction._id} auction={auction}/>)
                ) : (
                    <p className="text-center text-indigo-800 font-bold text-[20px]">
                        No active auctions
                    </p>
                )}
            </ul>
        </div>
    );
};

export default New;

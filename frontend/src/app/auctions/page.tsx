"use client";
import React, {useState, useEffect, useMemo} from "react";
import styles from "./Auctions.module.scss";
import {RootState, useAppSelector} from "@/app/redux/store";
import Lot from "@/components/Lot/Lot";
import Select from "@/components/ui/Select/Select";
import Pagination from "@/components/Pagination/Pagination";

// =================================
interface Auction {
    _id: string;
    title: string;
    startPrice: number;
    endTime: string;
    imageUrl: string;
    status: string;
    creator: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface SelectItem {
    name: string;
    value: string;
}

const Auctions: React.FC = () => {
    const auctions = useAppSelector((state) => state.auctions.auctions);
    const [currentAuctions, setCurrentAuctions] = useState<Auction[]>([]);
    const [tempAuctions, setTempAuctions] = useState<Auction[]>(auctions); // Единый отсортированный массив

    const selectItems: SelectItem[] = [
        {name: "Newest First", value: "desc"},
        {name: "Oldest First", value: "asc"},
    ];
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
    const [sortOrderEndTime, setSortOrderEndTime] = useState<"asc" | "desc" | "">("");
    const [activeSortType, setActiveSortType] = useState<"createdAt" | "endTime" | "none">("none"); // Текущая активная сортировка

    // =============================
    const sortAuctions = useMemo(() => {
        if (!sortOrder) return auctions;
        console.log("=====sortOrder=====", sortOrder);
        const newAuctions = [...auctions].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        });
        return newAuctions;
    }, [auctions, sortOrder]);

    const sortEndTime = useMemo(() => {
        if (!sortOrderEndTime) return auctions;
        console.log("=====sortOrderEndTime=====", sortOrderEndTime);
        const newAuctions = [...auctions].sort((a, b) => {
            const dateA = new Date(a.endTime);
            const dateB = new Date(b.endTime);
            return sortOrderEndTime === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        });
        return newAuctions;
    }, [auctions, sortOrderEndTime]);

    // =============pagination=================
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Обновляем tempAuctions и currentAuctions при сортировке
    useEffect(() => {
        if (activeSortType === "createdAt") {
            setTempAuctions(sortAuctions);
            setCurrentAuctions(sortAuctions.slice(indexOfFirstItem, indexOfLastItem));
        }
    }, [sortAuctions, indexOfFirstItem, indexOfLastItem, activeSortType]);

    useEffect(() => {
        if (activeSortType === "endTime") {
            setTempAuctions(sortEndTime);
            setCurrentAuctions(sortEndTime.slice(indexOfFirstItem, indexOfLastItem));
        }
    }, [sortEndTime, indexOfFirstItem, indexOfLastItem, activeSortType]);

    // Обработчики для установки активной сортировки
    const handleSortOrderChange = (value: "asc" | "desc" | "") => {
        setSortOrder(value);
        setActiveSortType(value ? "createdAt" : "none");
    };

    const handleSortOrderEndTimeChange = (value: "asc" | "desc" | "") => {
        setSortOrderEndTime(value);
        setActiveSortType(value ? "endTime" : "none");
    };

    // Изначальная установка tempAuctions при загрузке или сбросе сортировки
    useEffect(() => {
        if (activeSortType === "none") {
            setTempAuctions(auctions);
            setCurrentAuctions(auctions.slice(indexOfFirstItem, indexOfLastItem));
        }
    }, [auctions, activeSortType, indexOfFirstItem, indexOfLastItem]);

    return (
        <div>
            <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
                Auction List
            </h1>
            {currentAuctions.length > 0 ? (
                <div className="mt-3 grid grid-rows-2 gap-2 md:flex md:gap-4">
                    <div className="flex gap-2 items-center md:flex-col">
                        <h3 className="italic">Sorting by creation date:</h3>
                        <Select setSortOrder={handleSortOrderChange} selectItems={selectItems}/>
                    </div>

                    <div className="flex gap-2 items-center md:flex-col">
                        <h3 className="italic">Sorting by end date:</h3>
                        <Select setSortOrder={handleSortOrderEndTimeChange} selectItems={selectItems}/>
                    </div>
                </div>
            ) : (
                null
            )}


            <ul className="mt-4 grid md:grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-4 justify-items-center">
                {currentAuctions.length > 0 ? (
                    currentAuctions.map((auction) => <Lot key={auction._id} auction={auction}/>)
                ) : (
                    <p className="text-center text-indigo-800 font-bold text-[20px]">
                        No active auctions
                    </p>
                )}
            </ul>

            {/* Пагинация */}
            {currentAuctions.length > 0 && (
                <Pagination
                    items={tempAuctions}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            )}
        </div>
    );
};

export default Auctions;
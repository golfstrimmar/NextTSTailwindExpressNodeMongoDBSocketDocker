"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./Auctions.module.scss";
import { RootState, useAppSelector } from "@/app/redux/store";
import Lot from "@/components/Lot/Lot";
import Select from "@/components/ui/Select/Select";
// =================================

const New: React.FC = () => {
  const auctions = useAppSelector((state) => state.auctions.auctions);

  // =================================
  const selectItems = [
    { name: "Newest First", value: "desc" },
    { name: "Oldest First", value: "asc" },
  ] as const;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortOrderEndTime, setSortOrderEndTime] = useState<"asc" | "desc">(
    "desc"
  );

  // =================================
  const sortAuctions = (auctions, sortOrderEndTime, sortOrderCreatedAt) => {
    const newAuctions = [...auctions];
    return newAuctions.sort((a, b) => {
      const endTimeA = new Date(a.endTime);
      const endTimeB = new Date(b.endTime);
      const createdAtA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const createdAtB = b.createdAt ? new Date(b.createdAt) : new Date(0);
  
      // Сначала по endTime
      const endTimeDiff = sortOrderEndTime === "asc" ? endTimeA - endTimeB : endTimeB - endTimeA;
      if (endTimeDiff !== 0) return endTimeDiff;
  
      // Если endTime одинаковые, по createdAt
      return sortOrderCreatedAt === "asc" ? createdAtA - createdAtB : createdAtB - createdAtA;
    });
  };
  
  const currentAuctions = useMemo(() => {
    return sortAuctions(auctions, sortOrderEndTime, sortOrder);
  }, [auctions, sortOrder, sortOrderEndTime]);
  
  // =================================

  return (
    <div>
      <h2 className="text-2xl font-semibold italic text-gray-800 text-center">
        Auction List
      </h2>

      <div className="flex gap-8">
        {/* Сортировка по дате создания*/}
        <div className="flex gap-2 items-center mt-6">
          <h3 className="italic">Sorting by creation date:</h3>
          <Select setSortOrder={setSortOrder} selectItems={selectItems} />
        </div>
        {/* Сортировка по дате окончания*/}
        <div className="flex gap-2 items-center mt-6">
          <h3 className="italic">Sorting by end date:</h3>
          <Select
            setSortOrder={setSortOrderEndTime}
            selectItems={selectItems}
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {currentAuctions.length > 0 ? (
          currentAuctions.map((auction) => (
            <Lot key={auction._id} auction={auction} />
          ))
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

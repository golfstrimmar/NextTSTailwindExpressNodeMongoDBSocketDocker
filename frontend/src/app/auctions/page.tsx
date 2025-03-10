"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./Auctions.module.scss";
import { RootState, useAppSelector } from "@/app/redux/store";
import Lot from "@/components/Lot/Lot";
import Select from "@/components/ui/Select/Select";
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
  const [currentAuctions, setCurrentAuctions] = useState([]);
  // =================================
  const selectItems: SelectItem[] = [
    { name: "Newest First", value: "desc" },
    { name: "Oldest First", value: "asc" },
  ];
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortOrderEndTime, setSortOrderEndTime] = useState<"asc" | "desc">(
    "desc"
  );

  //  =============================
  const sortAuctions = (arg: Auction[], sortOrder: "asc" | "desc") => {
    const currentAuctions = [...arg];
    return currentAuctions.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  };

  const sortEndTime = (
    arg: Auction[],
    sortOrderEndTime: "asc" | "desc"
  ): Auction[] => {
    const currentAuctions = [...arg];
    return currentAuctions.sort((a, b) => {
      const dateA = new Date(a.endTime);
      const dateB = new Date(b.endTime);

      if (sortOrderEndTime === "asc") {
        return dateA.getTime() - dateB.getTime();
      }
      if (sortOrderEndTime === "desc") {
        return dateB.getTime() - dateA.getTime();
      }
    });
  };
  //  =============================

  useEffect(() => {
    if (sortOrder) {
      setCurrentAuctions(sortAuctions(auctions, sortOrder));
    }
  }, [auctions, sortOrder]);

  useEffect(() => {
    if (sortOrderEndTime) {
      setCurrentAuctions(sortEndTime(auctions, sortOrderEndTime));
    }
  }, [auctions, sortOrderEndTime]);
  // =================================

  return (
    <div>
      <h2 className="text-2xl font-semibold italic text-gray-800 text-center">
        Auction List
      </h2>

      <div className="grid grid-cols-2  gap-4">
        <div className="flex gap-2 items-center mt-6">
          <h3 className="italic">Sorting by creation date:</h3>
          <Select setSortOrder={setSortOrder} selectItems={selectItems} />
        </div>

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

export default Auctions;

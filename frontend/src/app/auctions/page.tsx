"use client";
import React, { useState, useEffect } from "react";
import styles from "./Auctions.module.scss";
import { RootState, useAppSelector } from "@/app/redux/store";
import Lot from "@/components/Lot/Lot";
// =================================

const New: React.FC = () => {
  const auctions = useAppSelector((state) => state.auctions.auctions);
  return (
    <div>
      <h2 className="text-2xl font-semibold italic text-gray-800 text-center">
        Auction List:
      </h2>
      <ul className="mt-4 flex flex-col gap-4">
        {auctions.length > 0 ? (
          auctions.map((auction) => <Lot key={auction._id} auction={auction} />)
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

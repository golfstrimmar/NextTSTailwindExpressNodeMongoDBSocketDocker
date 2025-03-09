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
        {auctions.map((auction) => (
          <Lot key={auction._id} auction={auction} />
          // <li key={auction._id}>
          //   {auction.title} - {auction.startPrice} -{" "}
          //   {new Date(auction.endTime).toLocaleString()} - {auction.imageUrl}
          // </li>
        ))}
      </ul>
    </div>
  );
};

export default New;

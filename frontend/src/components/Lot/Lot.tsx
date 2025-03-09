"use client";
import React, { useState, useEffect } from "react";
import styles from "./Lot.module.scss";
// =================================

// =================================
interface Lot {
  _id: string;
  title: string;
  createdAt: string;
  endTime: string;
  imageUrl: string;
  startPrice: number;
  status: string;
  creator: string;
}

interface LotProps {
  auction: Lot;
}

// =================================
const Lot: React.FC<LotProps> = ({ auction }) => {
  return (
    <li
      key={auction._id}
      className="bg-white shadow-md rounded-xl p-6 flex gap-6 hover:shadow-lg transition-shadow duration-300 md:flex-row flex-col md:items-center "
    >
      {auction.imageUrl ? (
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-40 h-40 object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
        />
      ) : (
        <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {auction.title}
            </h2>
            <p className="text-lg text-gray-600">
              Start Price: ${auction.startPrice}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Ends: {new Date(auction.endTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Status: {auction.status}</p>
            <p className="text-sm text-gray-500">
              Creator: {auction.creator?.userName || "Unknown"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Created: {new Date(auction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {/* <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={bidAmounts[auction._id] || ""}
            onChange={(e) =>
              handleBidChange(auction._id, Number(e.target.value))
            }
            className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter bid"
          />
          <button
            onClick={() => placeBid(auction._id)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
            disabled={timeLeft[auction._id] === "Ended"}
          >
            Place Bid
          </button>
        </div> */}
      </div>
    </li>
  );
};

export default Lot;

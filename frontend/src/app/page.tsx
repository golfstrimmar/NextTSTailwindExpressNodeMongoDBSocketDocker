"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Auction {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  endTime: string;
}

const HomePage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(apiUrl!);
        setAuctions(response.data);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-4">Auction Home</h1>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {auctions.map((auction) => (
          <div key={auction.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{auction.title}</h2>
            <p>Current Bid: ${auction.currentBid}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default HomePage;

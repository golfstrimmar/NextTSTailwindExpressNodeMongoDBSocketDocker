"use client";
import React, { useState, useEffect } from "react";
import styles from "./Lot.module.scss";
import { useSelector } from "react-redux";
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модалки
  const [bidAmount, setBidAmount] = useState<number | "">(""); // Значение ставки
  const [error, setError] = useState<string | null>(null); // Ошибка от сервера
  const socket = useSelector((state: any) => state.socket.socket);

  // =================================
  useEffect(() => {
    console.log("===auction===", auction);
  }, []);
  // =================================
  // Открытие/закрытие модалки
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setBidAmount(""); // Сбрасываем поле
    setError(null); // Сбрасываем ошибку
  };
  // =================================
  // Обработка ввода ставки
  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value === "" ? "" : Number(value));
  };
  // =================================
  // Отправка ставки
  const placeBid = () => {
    console.log("=====bid=====");
    if (!bidAmount || bidAmount <= (auction.currentBid || auction.startPrice)) {
      setError(
        `Bid must be higher than $${auction.currentBid || auction.startPrice}`
      );
      return;
    }

    const token = localStorage.getItem("token"); // Предполагаем, что токен хранится в localStorage
    if (!token) {
      setError("Please log in to place a bid");
      return;
    }
    console.log("===== auction._id=====", auction._id);
    console.log("=====bidAmount=====", bidAmount);
    console.log("===== token=====", token);
    if (socket) {
      socket.emit("placeBid", {
        auctionId: auction._id,
        amount: bidAmount,
        token,
      });
      socket.on("bidPlaced", (data) => {
        console.log("Bid placed:", data);
        closeModal(); // Закрываем модалку при успехе
      });
      socket.on("bidError", (message) => {
        setError(message);
      });
    }
  };

  // Очистка слушателей при размонтировании
  useEffect(() => {
    return () => {
      socket?.off("bidPlaced");
      socket?.off("bidError");
    };
  }, [socket]);
  // =================================
  // =================================
  // =================================
  return (
    <li
      key={auction._id}
      className="bg-white shadow-md rounded-xl p-6 flex gap-6 hover:shadow-lg transition-shadow duration-300  flex-col md:flex-row md:items-center "
    >
      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Place a Bid on "{auction.title}"
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Bid ($)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={handleBidChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder={`Enter more than $${
                  auction.currentBid || auction.startPrice
                }`}
                min={auction.currentBid || auction.startPrice}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex gap-4">
              <button
                onClick={placeBid}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Submit Bid
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
        {/*<div>*/}
        {/*    <div>*/}
        {/*        <h2 className="text-2xl font-bold text-gray-800 mb-2">*/}
        {/*            {auction.title}*/}
        {/*        </h2>*/}
        {/*        <p className="text-lg text-gray-600">*/}
        {/*            Start Price: ${auction.startPrice}*/}
        {/*        </p>*/}
        {/*        <p className="text-sm text-gray-600 mt-1">*/}
        {/*            Ends: {new Date(auction.endTime).toLocaleString()}*/}
        {/*        </p>*/}
        {/*        <p className="text-sm text-gray-500">Status: {auction.status}</p>*/}
        {/*        <p className="text-sm text-gray-500">*/}
        {/*            Creator: {auction.creator?.userName || "Unknown"}*/}
        {/*        </p>*/}
        {/*        <p className="text-sm text-gray-400 mt-1">*/}
        {/*            Created: {new Date(auction.createdAt).toLocaleDateString()}*/}
        {/*        </p>*/}
        {/*    </div>*/}
        {/*</div>*/}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {auction.title}
              </h2>
              <p className="text-lg text-gray-600">
                Start Price: ${auction.startPrice}
              </p>
              {auction.currentBid && (
                <p className="text-lg text-gray-600">
                  Current Bid: ${auction.currentBid}
                </p>
              )}
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
          <button
            onClick={openModal}
            className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
            disabled={auction.status !== "active"}
          >
            Place Bid
          </button>
        </div>
      </div>
    </li>
  );
};

export default Lot;

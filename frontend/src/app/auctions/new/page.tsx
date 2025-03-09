"use client";
import React, { useState, useEffect } from "react";
import styles from "./New.module.scss";
import AddAuctionForm from "@/components/AddAuctionForm/AddAuctionForm";
// =================================

// =================================
const New: React.FC = () => {
  return (
    <div className={`${styles.new} `}>
      <div>
        <AddAuctionForm></AddAuctionForm>
      </div>
    </div>
  );
};

export default New;

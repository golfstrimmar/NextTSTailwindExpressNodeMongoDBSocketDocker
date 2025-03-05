'use client';
import React , { useState, useEffect } from 'react';
import styles from './New.module.scss';
import AddAuctionForm from '@/components/AddAuctionForm/AddAuctionForm';
// =================================

// =================================
// interface NewProps {
//   handlerburgerClick: () => void;
//   isOpen: boolean;
// }
// =================================
const New: React.FC = () => {
  return (
    <div className={`${styles.new} `}>
      <div
        // className={`${styles.burger} ${isOpen ? styles.run : ""}`}
        // onClick={() => {
        //   handlerburgerClick();
        // }}
      >
        <AddAuctionForm></AddAuctionForm>
      </div>
    </div>
  );
};

export default New;
  
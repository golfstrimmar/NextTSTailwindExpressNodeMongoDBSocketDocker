"use client";
import React from "react";
import styles from "./Input.module.scss";

interface InputProps {
  typeInput:
    | "text"
    | "textarea"
    | "number"
    | "datetime-local"
    | "email"
    | "tel"
    | "date"
    | "time";
  data: string;
  value: string;
  inputRef: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const Input: React.FC<InputProps> = ({ typeInput, data, value, onChange }) => {
  return (
    <div className={styles["input-field"]}>
      {typeInput === "textarea" ? (
        <textarea
          id={data}
          name={data}
          value={value}
          onChange={onChange}
          required
        />
      ) : (
        <input
          id={data}
          name={data}
          type={typeInput} 
          value={value}
          onChange={(e) => {
            console.log("Input onChange:", e.target.value);
            onChange(e);
          }}
          required
        />
      )}
      <label htmlFor={data}>{data}</label>
    </div>
  );
};

export default Input;

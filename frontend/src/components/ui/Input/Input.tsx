"use client";
import { useEffect, useRef } from "react";
import styles from "./Input.module.scss";

interface InputProps {
  typeInput: "text" | "textarea"; 
  data: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const Input: React.FC<InputProps> = ({ typeInput, data, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

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
          ref={inputRef}
          id={data}
          name={data}
          type={typeInput}
          value={value}
          onChange={onChange}
          required
        />
      )}
      <label htmlFor={data}>{data}</label>
    </div>
  );
};

export default Input;

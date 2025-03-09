"use client";
import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import ButtonSuccessWave from "@/components/ButtonSuccessWave/ButtonSuccessWave";
import { useSelector } from "react-redux";
import styles from "./RegisterPage.scss";
import Eye from "@/assets/svg/eye.svg";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
// ================================

// ================================
interface User {
  _id?: string;
  userName?: string;
}
interface SocketData {
  user: User;
  message: string;
  token: string;
  error: string;
  currentemail?: string;
  passwordrequired?: string;
}
const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const socket = useSelector((state: any) => state.socket.socket);
  // const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{
    username: string;
    email: string;
    password: string;
  }>({
    username: "",
    email: "",
    password: "",
  });
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);

  useEffect(() => {
    if (socket) {
      socket.on("registrationSuccess", (data: SocketData) => {
        console.log("===--- registrationSuccess ---====", data);
        setSuccessMessage(data.message);
        setOpenModalMessage(true);
        setTimeout(() => {
          setSuccessMessage("");
          setOpenModalMessage(false);
          // navigate("/login");
        }, 2000);
      });
      socket.on("googleRegisterSuccess", (data: SocketData) => {
        // console.log("===--- googleRegisterSuccess ---====", data);
        // console.log("===--- data.user ---====", data.user);
        // console.log("===--- data.token ---====", data.token);
        setSuccessMessage(data.message);
        setOpenModalMessage(true);
        setTimeout(() => {
          setSuccessMessage("");
          setOpenModalMessage(false);
          // navigate("/login");
        }, 2000);
      });

      socket.on("registrationError", (data: SocketData) => {
        console.log("===--- registrationError ---====", data.error);
        setSuccessMessage(data.message);
        setOpenModalMessage(true);
        setTimeout(() => {
          setSuccessMessage("");
          setOpenModalMessage(false);
        }, 2000);
      });
    }
  }, [socket]);

  const validateForm = () => {
    let isValid = true;
    let errors = { username: "", email: "", password: "" };
    if (!username) {
      errors.username = "Username is required";
      isValid = false;
    }
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is not valid";
      isValid = false;
    }
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    setFormErrors(errors);
    return { isValid, errors };
  };

  const handleRegister = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { isValid, errors } = validateForm();
    if (!isValid) {
      console.log("===--- formErrors ---====", formErrors);
      const errorList = Object.values(errors).filter((error) => error !== "");
      const newFormErrors = errorList.join(", ");
      setSuccessMessage(newFormErrors);
      setOpenModalMessage(true);
      setTimeout(() => {
        setSuccessMessage("");
        setOpenModalMessage(false);
      }, 2000);
      return;
    }
    console.log("===--- register ---====", username, email, password);
    if (socket) {
      socket.emit("register", { username, email, password });
    }
  };

  // Видимость пароля

  const handlerVisiblePassword = () => {
    if (passwordInputRef.current) {
      passwordInputRef.current.type =
        passwordInputRef.current.type === "password" ? "text" : "password";
    }
  };

  // Обработка ответа от Google
  const responseGoogle = (response: CredentialResponse) => {
    const { credential } = response; // Получаем токен Google
    if (!credential) {
      console.log(
        "===--- Google registration failed. Please try again. ---===="
      );
      return;
    }
    console.log("Google token received:", credential);
    // Отправляем токен на сервер через сокет
    if (socket) {
      socket.emit("googleRegister", { token: credential });
    }
  };
  return (
    <div className={`${styles.registration}}`}>
      <div className={`${styles.container}}`}>
        <ModalMessage message={successMessage} open={openModalMessage} />
        <h2 className="text-2xl font-semibold italic text-gray-800 text-center">
          Registration
        </h2>
        <form
          className={` flex flex-col gap-2 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4`}
        >
          <Input
            typeInput="text"
            data="User name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            typeInput="email"
            data="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="input-password">
            <div className="inline-block relative">
              <Input
                inputRef={passwordInputRef}
                typeInput="password"
                data="User Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Eye
                className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer opacity-50"
                onClick={handlerVisiblePassword}
              ></Eye>
            </div>
          </div>

          <button className="googleLoginButton">
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => {
                setOpenModalMessage(true);
                setSuccessMessage("Failed to log in via Google.");
                setTimeout(() => {
                  setSuccessMessage("");
                  setOpenModalMessage(false);
                }, 2000);
              }}
            />
          </button>
          <Button
            onClick={(e) => {
              handleRegister(e);
            }}
          >
            Registration
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

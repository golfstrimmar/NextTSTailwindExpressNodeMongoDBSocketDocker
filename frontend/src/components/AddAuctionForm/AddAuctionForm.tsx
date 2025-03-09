"use client";
import React, { useState, useEffect } from "react";
import styles from "./AddAuctionForm.module.scss";
import Input from "../ui/Input/Input";
import axios from "axios";
import ImagesIcon from "@/assets/svg/images.svg";
import Button from "../ui/Button/Button";
import Calendar from "../ui/Calendar/Calendar";
import ClockUhr from "@/components/ui/ClockUhr/ClockUhr";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { useSelector, useDispatch } from "react-redux";
import { RootState, useAppSelector } from "@/app/redux/store";
// =================================

// =================================

// =================================
// interface AddAuctionFormProps {
//   handlerburgerClick: () => void;
//   isOpen: boolean;
// }
interface EndTime {
  lotDate: string;
  time: string;
}
const AddAuctionForm: React.FC = () => {
  //  const user = useSelector((state: any) => state.auth.user as User);
  const dispatch = useDispatch();
  const socket = useAppSelector((state: RootState) => state.socket.socket);
  const auctions = useAppSelector((state) => state.auctions.auctions);
  const [title, setTitle] = useState<string>("");
  const [startPrice, setStartPrice] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(
    new Date().toLocaleString().slice(11, 17)
  );
  const [endTime, setEndTime] = useState<EndTime>({
    lotDate: new Date().toLocaleString().slice(0, 10),
    time: "00:00",
  });

  const resetForm = () => {
    setTitle("");
    setStartPrice(0);
    setEndTime({
      lotDate: new Date().toLocaleString().slice(0, 10),
      time: "00:00",
    });
    setImage(null);
    setImagePreview(null);
    setImageUrl(null);
    setDate(new Date());
    setTime(new Date().toLocaleString().slice(11, 17));
    setSuccessMessage("");
    setOpenModalMessage(false);
  };
  // =================================
  useEffect(() => {
    if (socket) {
      socket.on("auctionAdded", (data) => {
        console.log("===auctionAdded:====", data.message);
        setSuccessMessage(data.message);
        setOpenModalMessage(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          resetForm();
        }, 2000);
      });
      socket.on("erroraddingauction", (errorMessage) => {
        setSuccessMessage(errorMessage);
        setOpenModalMessage(true);
        setTimeout(() => {
          setSuccessMessage("");
          setOpenModalMessage(false);
        }, 2000);
      });
    }
  }, [socket]);

  // =================================
  const handleImageUpload = async (): Promise<string | undefined> => {
    if (image) {
      const imageFormData = new FormData();
      imageFormData.append("file", image);
      imageFormData.append("upload_preset", "blogblog");
      imageFormData.append("cloud_name", "dke0nudcz");

      try {
        const imageResponse = await axios.post(
          process.env.NEXT_PUBLIC_CLOUDINARY_URL as string,
          imageFormData
        );
        console.log(
          "===--- imageResponse ---====",
          imageResponse.data.secure_url
        );
        return imageResponse.data.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        setSuccessMessage("Failed to upload image.");
        setOpenModalMessage(true);
        setTimeout(() => {
          setOpenModalMessage(false);
        }, 2000);
      }
    }
  };

  // ----------------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; // Получаем первый файл
      setImage(file); // Устанавливаем выбранный файл

      if (file) {
        const previewUrl = URL.createObjectURL(file); // Создаём превью
        setImagePreview(previewUrl); // Устанавливаем превью
      }
    } else {
      setImage(null); // Если файл не выбран, сбрасываем состояние
      setImagePreview(null);
    }
  };

  // ----------------------------------
  const TitleHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTitle(e.target.value);
  };

  // =================================
  const handlerNumberOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStartPrice(e.target.value);
  };
  useEffect(() => {
    console.log(startPrice);
  }, [startPrice]);
  // =================================
  const handleUhrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };
  // =================================
  // Формирование единого объекта endTime для отправки
  const getFullEndTime = (): string => {
    const { lotDate, time } = endTime;
    const [year, month, day] = lotDate.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hours) ||
      isNaN(minutes)
    ) {
      console.error("Invalid date/time values:", {
        year,
        month,
        day,
        hours,
        minutes,
      });
      return new Date().toISOString();
    }

    const endDateTime = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(endDateTime.getTime())) {
      console.error("Invalid Date created");
      return new Date().toISOString();
    }

    return endDateTime.toISOString();
  };

  // =================================
  const handleSubmit = async (
    e?:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!title || !startPrice || !endTime || !image) {
      setSuccessMessage("Title, Start Price, End Time and Image is required!");
      setOpenModalMessage(true);
      setTimeout(() => {
        setOpenModalMessage(false);
      }, 2000);
      return;
    }

    try {
      const imageUrl = await handleImageUpload();
      const endDateTime = getFullEndTime();
      const auctionData = {
        title,
        startPrice,
        endTime: endDateTime,
        imageUrl: imageUrl,
      };

      if (socket) {
        socket.emit("addAuction", {
          auctionData,
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
    }
  };
  // =================================

  return (
    <>
      <form
        className={`${styles.addauctionform} flex flex-col gap-2 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4`}
      >
        <ModalMessage message={successMessage} open={openModalMessage} />
        <h2 className="text-2xl font-semibold italic text-gray-800">
          Add Auction Form
        </h2>
        <h3 className="text-gray-700 font-bold italic ">
          Title:
          {title}
        </h3>
        <Input
          typeInput="text"
          data="Title"
          value={title}
          onChange={TitleHandler}
        />
        <h3 className="text-gray-700 font-bold  italic ">
          Start Price: {startPrice}
        </h3>
        <Input
          typeInput="number"
          data=""
          value={startPrice}
          onChange={handlerNumberOnChange}
        />
        <h3 className="text-gray-700 font-bold  italic ">
          End Date: {endTime?.lotDate}
        </h3>
        <h3 className="text-gray-700 font-bold  italic ">
          End Time: {endTime?.time}
        </h3>
        {/* <h5>
        date:{" "}
        {date
          ? new Date(date).toLocaleString().slice(0, 10)
          : "No date selected"}
      </h5> */}
        <Calendar setFinishDate={setDate} />
        <div className={styles["clockUhr"]}>
          <ClockUhr value={time} onChange={handleUhrChange} />
        </div>

        <h3 className="text-gray-700 font-bold  italic ">Post image:</h3>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <label htmlFor="image-upload" className="cursor-pointer  transition">
          <ImagesIcon className={`${styles.images} `} />
        </label>
        {imagePreview && (
          <>
            <h3 className="text-gray-700 font-bold  italic ">Image Preview:</h3>
            <div className="w-[100px] h-[100px] relative cursor-pointer">
              <div className="imgs">
                <img src={imagePreview} alt="Image preview" />
              </div>
            </div>
          </>
        )}
        <Button onClick={handleSubmit} children="Add Auction" />
      </form>
    </>
  );
};

export default AddAuctionForm;

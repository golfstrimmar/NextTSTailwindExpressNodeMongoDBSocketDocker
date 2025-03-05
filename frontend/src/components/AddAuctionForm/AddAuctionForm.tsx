'use client';
import React , { useState, useEffect } from 'react';
import styles from './AddAuctionForm.module.scss';
import Input from '../ui/Input/Input';
import axios from 'axios';
import ImagesIcon  from "@/assets/svg/images.svg";
import Button from '../ui/Button/Button';
import Calendar from '../ui/Calendar/Calendar';
// import ClockPicker from '../ClockPicker/ClockPicker';
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
  //  const socket = useSelector((state: any) => state.socket.socket);

  const [title, setTitle] = useState<string>("");
  const [startPrice, setStartPrice] = useState<number>(0);

// let tomorrow = new Date();
// tomorrow.setDate(tomorrow.getDate() + 1);
// tomorrow.setHours(12, 0, 0, 0); // 12:00
// const initialEndTime = tomorrow.toISOString().slice(0, 16);

  const [message, setMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(""); 
 const [endTime, setEndTime] = useState<EndTime>({
   lotDate: new Date().toLocaleString().slice(0, 10),
   time: new Date().toLocaleString().slice(11, 16), // исправил на 16, чтобы показывало `hh:mm`
 });
  //  const dispatch = useDispatch();
  //  const navigate = useNavigate();

  //  const tags: string[] = ["trip", "mobile", "adventure"];
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
        setMessage("Failed to upload image.");
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
  // =================================
  const handleSubmit = async (
    e?:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (e && e.preventDefault) {
      e.preventDefault(); 
    }

    if (!title) {
      setMessage("Title is required!");
      setOpenModalMessage(true);
      setTimeout(() => {
        setOpenModalMessage(false);
      }, 2000);
      return;
    }
console.log(title, startPrice, endTime, imageUrl);
    if (image) {
      try {
        // Дожидаемся завершения загрузки изображения
        const imageUrl = await handleImageUpload();
        console.log("===--- imageUrl ---====", imageUrl);
        
        // socket.emit("createPost", {
        //   title,
        //   startPrice,
        //   endTime,
        //   imageUrl: imageUrl
        // });
      } catch (error) {
        console.error("Ошибка загрузки изображения:", error);
      }
    } else {
      // socket.emit("createPost", {
      //   title,
      //   startPrice,
      //   endTime,
      //   imageUrl: ""
      // });
    }
  };
  // ----------------------------------
  const TitleHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
      setTitle(e.target.value);
  };
  useEffect(() => {
   console.log( title)
  }, [title]);
 
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
  // const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log("New endTime:", e.target.value);
  //   setEndTime(e.target.value); 
  // };
  //   useEffect(() => {
  //     console.log(endTime);
  //   }, [endTime]);
  // =================================


  // const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log("New date:", e.target.value);
  //   setDate(e.target.value);
  // };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("New time:", e.target.value);
    setTime(e.target.value);
  };

useEffect(() => {
  console.log("==date, time===", date, time);
  if (date ) {
    const newEndTime = {
      lotDate: `${new Date(date).toLocaleString().slice(0, 10)}`,
      time: `${time}`,
    };
    console.log("=====EndTime======", newEndTime);
    setEndTime(newEndTime);
  }
  
  
}, [date, time]);

  useEffect(() => {
   console.log("Combined endTime:", endTime);
  }, [endTime]);
  // =================================
  return (
    <form className={`${styles.addauctionform} `}>
      <h2>Add Auction Form</h2>
      <p>Title: {title}</p>
      <Input
        typeInput="text"
        data="Title"
        value={title}
        onChange={TitleHandler}
      />
      <p>startPrice: {startPrice}</p>
      <Input
        typeInput="number"
        data="Start Price"
        value={startPrice}
        onChange={handlerNumberOnChange}
      />
      <span>===================</span>
      <p>End Date: {endTime && endTime.lotDate}</p>
      <p>End Time: {endTime && endTime.time}</p>
      <span>===================</span>
      <h5>date: {new Date(date).toLocaleString().slice(0, 10)}</h5>
      <Calendar setFinishDate={setDate} />
      {/* <ClockPicker onTimeChange={handleTimeChange} /> */}
      <span>===================</span>
      <Input
        typeInput="time"
        data="End Time"
        value={time}
        onChange={handleTimeChange}
      />
      <span>===================</span>
      <p>Post image:</p>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
      <label htmlFor="image-upload">
        <ImagesIcon className={`${styles.images} `} />
      </label>
      {imagePreview && (
        <div>
          <span>Image preview: </span>
          <img
            className={`${styles["image-preview"]} `}
            src={imagePreview}
            alt="Image preview"
          />
        </div>
      )}
      <Button onClick={handleSubmit} children="Add Auction" />
    </form>
  );
};

export default AddAuctionForm;
  //   className={`${styles.burger} ${isOpen ? styles.run : ""}`}
      //   onClick={() => {
      //     handlerburgerClick();
      //   }}
      // >
import Image from "next/image";
import { FormEventHandler, InputHTMLAttributes } from "react";
import mapImg from "../public/working-tile.webp";
import style from "./MapSlice.module.css";

export const MapSlice = () => {
  const handleInput: FormEventHandler<HTMLInputElement> = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {
      target: { files },
    } = e;
    try {
      const file = files[0];

      let reader = new FileReader();
      reader.onload = async function () {
        const res = await fetch("/api/map", {
          method: "POST",
          body: reader.result,
        });
        console.log("res", res);
      };
      await reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={style.image}>
      <Image alt="Main map" layout="responsive" src={mapImg} />
      <input type="file" name="upload" id="upload" onInput={handleInput} />
    </div>
  );
};

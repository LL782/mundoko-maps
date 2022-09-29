import Image from "next/image";
import mapImg from "../public/working-tile.webp";
import style from "./MapSlice.module.css";

export const MapSlice = () => {
  const handleSlickButton = console.log;

  return (
    <div className={style.image}>
      <Image alt="Main map" layout="responsive" src={mapImg} />
      <button className={style.button} onClick={handleSlickButton}>
        Slice
      </button>
    </div>
  );
};

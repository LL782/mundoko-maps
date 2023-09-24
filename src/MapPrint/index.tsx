import Image from "next/image";
import mapImg from "../public/working-tile.webp";
import style from "./MapPrint.module.css";

export const MapPrint = () => (
  <div className={style.image}>
    <Image
      alt="Main map"
      src={mapImg}
      sizes="100vw"
      style={{
        width: "100%",
        height: "auto"
      }} />
  </div>
);

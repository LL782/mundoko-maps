import Image from "next/image";
import mapImg from "../public/working-tile.webp";
import style from "./MapPrint.module.css";

export const MapPrint = () => (
  <div className={style.image}>
    <Image alt="Main map" layout="responsive" src={mapImg} />
  </div>
);

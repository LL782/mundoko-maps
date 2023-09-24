import Image from "next/image";
import style from "./MapPrint.module.css";

export const MapPrint = () => (
  <div className={style.image}>
    <Image
      alt="Main map"
      src="/working-tile.webp"
      sizes="100vw"
      width={20}
      height={20}
      style={{
        width: "100%",
        height: "auto",
      }}
    />
  </div>
);

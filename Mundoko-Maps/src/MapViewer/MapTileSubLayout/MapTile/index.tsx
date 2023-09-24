import Image from "next/image";
import img from "../../../../public/working-tile.webp";

export const MapTile = () => (
  <Image
    alt="Main map"
    placeholder="blur"
    priority={true}
    src={img}
    sizes="100vw"
    style={{
      display: "block",
      width: "100%",
      height: "auto",
    }}
  />
);

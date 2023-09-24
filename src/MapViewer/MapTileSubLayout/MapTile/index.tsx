import Image from "next/image";
import mapImg from "../../../public/working-tile.webp";

export const MapTile = () => (
  <Image
    alt="Main map"
    placeholder="blur"
    priority={true}
    src={mapImg}
    sizes="100vw"
    style={{
      width: "100%",
      height: "auto"
    }} />
);

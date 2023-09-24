import Image from "next/image";
import mapImg from "../../../public/working-tile.webp";

export const MapTile = () => (
  <Image
    alt="Main map"
    layout="responsive"
    placeholder="blur"
    priority={true}
    src={mapImg}
  />
);

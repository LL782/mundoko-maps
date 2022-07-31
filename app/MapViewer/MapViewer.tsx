import Image from "next/image";
import mapImg from "../public/original-map.jpg";

export const MapViewer = () => (
  <Image
    alt="Main map"
    layout="responsive"
    placeholder="blur"
    priority={true}
    src={mapImg}
  />
);

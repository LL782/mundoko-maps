import Image from "next/image";
import img from "../public/key+scale_bars.webp";

export const MapKeyAndScaleBars = () => (
  <Image
    alt="Main map"
    layout="responsive"
    placeholder="blur"
    priority={true}
    src={img}
  />
);

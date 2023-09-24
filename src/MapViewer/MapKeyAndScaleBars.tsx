import Image from "next/image";
import img from "../public/key+scale_bars.webp";

export const MapKeyAndScaleBars = () => (
  <Image
    alt="Main map"
    placeholder="blur"
    priority={true}
    src={img}
    sizes="100vw"
    style={{
      width: "100%",
      height: "auto"
    }} />
);

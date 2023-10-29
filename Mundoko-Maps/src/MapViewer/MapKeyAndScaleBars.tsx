import Image from "next/image";
import imgCity from "../../public/key+scale_bars-city.webp";

interface Props {
  scale: PageScale;
}

export const MapKeyAndScaleBars = ({ scale }: Props) => {
  if (scale !== "City") {
    return <>No key and scale bars for {scale} scale</>;
  }

  return (
    <Image
      alt="Map key and scale bars"
      placeholder="blur"
      priority={true}
      src={imgCity}
      sizes="100vw"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
      }}
    />
  );
};

import Image, { StaticImageData } from "next/image";

interface Props {
  src: StaticImageData;
}

export const MatchingTile = ({ src }: Props) => (
  <Image
    alt="Main map"
    placeholder="blur"
    priority={true}
    src={src}
    sizes="100vw"
    style={{
      display: "block",
      width: "100%",
      height: "auto",
    }}
  />
);

import Image from "next/image";
import emptyTile from "../../../../public/empty-tile.png";
import { PagePosition } from "../../../types/PagePosition";

interface Props {
  position: PagePosition;
}

export const GeneratedTile = ({ position }: Props) => {
  console.log("position:", position);
  return (
    <Image
      alt="Main map"
      placeholder="blur"
      priority={true}
      src={emptyTile}
      sizes="100vw"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
      }}
    />
  );
};

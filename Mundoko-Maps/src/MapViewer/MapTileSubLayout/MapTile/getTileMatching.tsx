import startHereTile from "../../../../public/working-tile.webp";
import { PagePosition } from "../../../types/PagePosition";

export const getTileMatching = (position: PagePosition) => {
  const { scale, east, south } = position;

  if (scale === "City" && south === 51550000 && east === 51350000) {
    return startHereTile;
  }
};

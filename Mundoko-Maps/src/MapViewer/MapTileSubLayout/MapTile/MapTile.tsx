import { PagePosition } from "../../../types/PagePosition";
import { GeneratedTile } from "./GeneratedTile";
import { getTileMatching } from "./getTileMatching";
import { MatchingTile } from "./MatchingTile";

interface Props {
  position: PagePosition;
}
export const MapTile = ({ position }: Props) => {
  const matchingTile = getTileMatching(position);

  return matchingTile ? (
    <MatchingTile src={matchingTile} />
  ) : (
    <GeneratedTile position={position} />
  );
};

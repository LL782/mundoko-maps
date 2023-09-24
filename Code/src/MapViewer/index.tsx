import { PagePosition } from "../types/PagePosition";
import { MapViewLayout } from "./Layout";

interface Props {
  position: PagePosition;
}

export const MapViewer = ({ position }: Props) => (
  <MapViewLayout position={position} />
);

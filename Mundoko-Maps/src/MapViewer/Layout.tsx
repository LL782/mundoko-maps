import style from "./Layout.module.css";
import { MapPositionBar } from "./MapPositionBar";
import { MapTitle } from "./MapTitle/MapTitle";
import { MapTileSubLayout } from "./MapTileSubLayout/Layout";
import { PagePosition } from "../types/PagePosition";

interface Props {
  position: PagePosition;
}

export const MapViewLayout = ({ position }: Props) => (
  <div className={style.container}>
    <MapTitle position={position} />
    <MapTileSubLayout position={position} />
    <MapPositionBar scale={position.scale} />
  </div>
);

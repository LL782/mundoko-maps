import style from "./Layout.module.css";
import { MapKeyAndScaleBars } from "../MapKeyAndScaleBars";
import { MapTile } from "./MapTile";
import { ScaleMargins } from "./ScaleMargins";
import { PagePosition } from "../../types/PagePosition";

interface Props {
  position: PagePosition;
}

export const MapTileSubLayout = ({ position }: Props) => (
  <div className={style.container}>
    <div className={style.centreSquare}>
      <MapTile />
      <ScaleMargins />
    </div>
    <MapKeyAndScaleBars scale={position.scale} />
  </div>
);

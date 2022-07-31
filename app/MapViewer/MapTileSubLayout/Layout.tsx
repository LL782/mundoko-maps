import style from "./Layout.module.css";
import { MapKeyAndScaleBars } from "../MapKeyAndScaleBars";
import { MapTile } from "./MapTile";
import { ScaleMargins } from "./ScaleMargins";

export const MapTileSubLayout = () => (
  <div className={style.container}>
    <div className={style.centreSquare}>
      <MapTile />
      <ScaleMargins />
    </div>
    <MapKeyAndScaleBars />
  </div>
);

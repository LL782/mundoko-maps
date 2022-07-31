import style from "./Layout.module.css";
import { MapPositionBar } from "./MapPositionBar";
import { MapTitle } from "./MapTitle/MapTitle";
import { MapTileSubLayout } from "./MapTileSubLayout/Layout";

export const MapViewLayout = () => (
  <div className={style.container}>
    <MapTitle />
    <MapTileSubLayout />
    <MapPositionBar />
  </div>
);

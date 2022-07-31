import { MapPositionBar } from "./Components/MapPositionBar";
import { MapTile } from "./Components/MapTile";
import { MapTitle } from "./Components/MapTitle";

export const MapViewLayout = () => (
  <>
    <MapTitle />
    <MapTile />
    <MapPositionBar />
  </>
);

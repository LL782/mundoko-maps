import { PagePosition } from "../../types/PagePosition";
import { formatFeet } from "../../UI/formatFeet";
import style from "./MapTitle.module.css";

interface Props {
  position: PagePosition;
}

export const MapTitle = ({ position: { scale, east, south } }: Props) => (
  <div className={style.container}>
    <h1 className={style.title}>Fortestend (Topographic)</h1>
    <h2 className={style.subtitle}>{`${scale} scale`}</h2>
    <p>{`Centre: ${formatFeet(east)} east and ${formatFeet(south)} south`}</p>
  </div>
);

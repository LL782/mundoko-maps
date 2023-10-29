import { PagePosition } from "../../../types/PagePosition";
import style from "./scaleMargins.module.css";
import { getScaleMarginsFrom } from "./getScaleMarginsFrom";

interface Props {
  position: PagePosition;
}

export const ScaleMargins = ({ position }: Props) => {
  const {
    northSouth: { points: northSouthPoints },
    westEast: { points: westEastPoints },
  } = getScaleMarginsFrom(position);

  return (
    <>
      <ol className={`${style.northSouthMargin} ${style.margin}`}>
        {northSouthPoints.map(toMarginMarker)}
      </ol>
      <ol className={`${style.westEastMargin} ${style.margin}`}>
        {westEastPoints.map(toMarginMarker)}
      </ol>
    </>
  );
};

const toMarginMarker = (n: number) => (
  <li key={n} className={style.marker}>
    {n}
  </li>
);

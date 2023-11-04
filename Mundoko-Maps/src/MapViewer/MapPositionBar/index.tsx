import { PagePosition } from "~/types/PagePosition";
import style from "./MapPositionBar.module.css";

const useExponential = (scale: PagePosition["scale"]) => {
  switch (scale) {
    case "State":
      return 5;
    case "City":
      return 4;
    default:
      return null;
  }
};
export const MapPositionBar = ({ scale }: { scale: PagePosition["scale"] }) => {
  const exponential = useExponential(scale);

  return (
    <div className={style.container}>
      <h2 className={style.title}>
        <span className={style.positionText}>
          {exponential ? (
            <>
              SCALE: Feet
              <span className={style.x}> x </span>10
              <sup className={style.sup}>{exponential}</sup>
            </>
          ) : (
            <>scale definition missing for {scale}</>
          )}
        </span>
      </h2>
    </div>
  );
};

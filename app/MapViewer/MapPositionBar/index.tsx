import style from "./MapPositionBar.module.css";

export const MapPositionBar = () => (
  <div className={style.container}>
    <h2 className={style.title}>
      <span className={style.positionText}>
        SCALE: Feet
        <span className={style.x}> x </span>10
        <sup className={style.sup}>3</sup>
      </span>
    </h2>
  </div>
);

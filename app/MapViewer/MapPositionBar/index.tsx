import style from "./MapPositionBar.module.css";

export const MapPositionBar = () => (
  <div className={style.container}>
    <h2 className={style.title}>
      <span className={style.scaleText}>City scale</span>
      <span className={style.positionText}>
        5135,5155<span className={style.x}> x </span>10
        <sup className={style.sup}>3</sup> feet
      </span>
    </h2>
  </div>
);

import style from "./MapTitle.module.css";

export const MapTitle = () => (
  <div className={style.container}>
    <h1 className={style.title}>Fortestend (Topographic)</h1>
    <h2 className={style.subtitle}>City Scale</h2>
    <p>Centre: 5,135,000&apos; east and 5,155,000&apos; south</p>
  </div>
);

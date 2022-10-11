import Link from "next/link";
import { ReactNode } from "react";
import style from "./DocumentationLayout.module.css";

interface Props {
  article: ReactNode;
}
export const DocumentationLayout = ({ article }: Props) => (
  <main className={style.page}>
    <h1 className={style.header}>
      <Link href="/">
        <a href="/">Mundoko Maps</a>
      </Link>
    </h1>
    <article>{article}</article>
  </main>
);

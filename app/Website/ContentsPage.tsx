import Link from "next/link";
import { DocumentationLayout } from "../UI/DocumentationLayout";
import style from "./ContentsPage.module.css";

export const ContentsPage = () => (
  <DocumentationLayout
    article={
      <>
        <h2>Contents</h2>
        <ol className={style.list}>
          <li>
            <h3>Maps</h3>
            <ol>
              <li>
                <Link href="/city/5135/5155">Start Here</Link>
              </li>
              <li>
                <Link href="/map-print">Print Test</Link>
              </li>
            </ol>
          </li>
          <li>
            <h3>Notes</h3>
            <ol>
              <li>
                <Link href="https://github.com/LL782/mundoko-maps/">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/map-slice">Map Slice</Link>
              </li>
            </ol>
          </li>
        </ol>
      </>
    }
  />
);

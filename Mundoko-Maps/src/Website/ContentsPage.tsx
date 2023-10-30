import Link from "next/link";
import { DocumentationLayout } from "../UI/DocumentationLayout";
import style from "./ContentsPage.module.css";
import Image from "next/image";

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
                <Link
                  href="https://pathfindertools.business.blog/2022/09/21/map-scales-and-grid-squares/"
                  target="_blank"
                >
                  <span>
                    Map scales, tiles and grids – blog post
                    <Image
                      alt="Opens in new tab"
                      src="/new-tab.png"
                      width={10}
                      height={10}
                      style={{
                        position: "relative",
                        left: "3px",
                        bottom: "-3px",
                        width: "15px",
                        height: "auto",
                      }}
                    />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/docs/map-slice">Notes about slicing tiles</Link>
              </li>
            </ol>
          </li>
        </ol>
      </>
    }
  />
);

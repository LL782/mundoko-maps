import Link from "next/link";
import style from "./MapSlice.module.css";

export const MapSlice = () => {
  return (
    <main className={style.page}>
      <h1 className={style.header}>
        <Link href="/">
          <a>Mundoko Maps</a>
        </Link>
      </h1>
      <article>
        <h2>Notes about Maps Slice</h2>
        <p>
          I tried to use <a href="https://www.npmjs.com/package/jimp">Jimp</a>{" "}
          in combination with an uploaded image and didn&apos;t get very far.
        </p>
        <ul>
          <li>Maybe I could research this specifically</li>
          <li>
            My trouble seemed to be passing a file from the browser to a node
            environment
          </li>
          <li>Running a node script locally should work</li>
          <li>
            Alt, the path to an image can be a URL, so I could aim for an image
            on the CDN
          </li>
        </ul>
        <h3>Next direction options</h3>
        <ol>
          <li>
            May try Jimp via a node script in the terminal referencing my local
            file-system
          </li>
          <li>
            May try zooming, scaling and overflow:hidden-ing img elements in
            HTML and printing them
          </li>
        </ol>
      </article>
    </main>
  );
};

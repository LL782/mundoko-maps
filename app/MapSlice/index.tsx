import style from "./MapSlice.module.css";

export const MapSlice = () => {
  return (
    <article className={style.post}>
      <h1>Notes about Maps Slice</h1>
      <p>
        I tried to use <a href="https://www.npmjs.com/package/jimp">jimp</a> in
        combination with an uploaded image and didn&apos;t get very far.
      </p>
      <ul>
        <li>Maybe I could research this specifically</li>
        <li>
          My trouble seemed to be passing a file from the browser to a node
          environment
        </li>
        <li>Running a node script locally should work</li>
        <li>
          Also, jimp seem to expect the images to be referenced by a path,
          including to a remote file
        </li>
        <li>Perhaps I could aim for an image on the CDN</li>
      </ul>
      <h2>Next steps</h2>
      <ol>
        <li>
          May try Jimp via a node script in the terminal referencing my local
          file-system
        </li>
      </ol>
    </article>
  );
};

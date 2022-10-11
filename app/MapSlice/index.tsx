import { DocumentationLayout } from "../UI/DocumentationLayout";

export const MapSlice = () => (
  <DocumentationLayout
    article={
      <>
        <h2>Notes about Slicing Tiles</h2>
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
          <li>
            Running a node script locally should work, giving Jimp the path to
            an image on my file system
          </li>
          <li>
            Alt., the path to an image can be a URL, so I could aim for an image
            on the CDN
          </li>
        </ul>
        <h3>Next direction options</h3>
        <ol>
          <li>May try Jimp via a node script in the terminal</li>
          <li>
            May try zooming, scaling and overflow:hidden-ing an image in HTML,
            and then printing them
          </li>
          <li>
            What I want is to generate a missing image tile based on slicing one
            from a larger scale (or stitching several from a smaller scale)
          </li>
        </ol>
      </>
    }
  />
);

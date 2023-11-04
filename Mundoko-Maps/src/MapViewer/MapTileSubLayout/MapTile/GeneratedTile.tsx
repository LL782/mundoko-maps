import Image, { StaticImageData } from "next/image";
import emptyTile from "../../../../public/empty-tile-grad.png";
import { PagePosition } from "../../../types/PagePosition";
import existingImage from "../../../../public/working-tile.webp";

interface Props {
  position: PagePosition;
}

const TilesFromScaleAbove = () => (
  <Image
    alt="Trace of layer above"
    placeholder="blur"
    priority={true}
    src={emptyTile}
    sizes="100vw"
    style={{
      display: "block",
      width: "100%",
      height: "auto",
    }}
  />
);

interface PropsSmallTile {
  matchingImg: StaticImageData | null;
}

const SmallTile = ({ matchingImg }: PropsSmallTile) => (
  <Image
    alt="Trace of tile from layer below"
    placeholder="blur"
    priority={true}
    src={matchingImg || emptyTile}
    sizes="100vw"
    style={{
      float: "left",
      width: "5%",
      height: "auto",
    }}
  />
);

const TilesFromScaleBelow = ({ position }: { position: PagePosition }) => {
  let tiles: Array<PropsSmallTile & { key: string }> = [];
  for (let i = 0; i < 400; i++)
    tiles.push({ key: "tile-" + i, matchingImg: null });

  if (
    position.scale === "State" &&
    position.east === 51350000 &&
    position.south === 51550000
  ) {
    tiles[189].matchingImg = existingImage;
  }

  return (
    <>
      {tiles.map((tile) => (
        <SmallTile key={tile.key} matchingImg={tile.matchingImg} />
      ))}
    </>
  );
};

interface PropsTileLayer {
  children: React.ReactNode;
}

const TileLayer = ({ children }: PropsTileLayer) => (
  <div
    style={{
      position: "absolute",
      opacity: 0.5,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  >
    {children}
  </div>
);

export const GeneratedTile = ({ position }: Props) => {
  return (
    <div style={{ position: "relative", paddingTop: "100%", height: 0 }}>
      <TileLayer>
        <TilesFromScaleAbove />
      </TileLayer>
      <TileLayer>
        <TilesFromScaleBelow position={position} />
      </TileLayer>
    </div>
  );
};

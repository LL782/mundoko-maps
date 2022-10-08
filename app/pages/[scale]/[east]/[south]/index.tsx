import type { GetStaticPropsContext, NextPage } from "next";
import Error from "next/error";
import Head from "next/head";
import { MapViewer } from "../../../../MapViewer";
import { Favicons } from "../../../../SiteChrome/Favicons";
import type {
  PagePosition,
  PositionParams,
} from "../../../../types/PagePosition";
import { formatFeet } from "../../../../UI/formatFeet";

interface Props {
  position?: PagePosition;
}

const MapPage: NextPage<Props> = ({ position }) => {
  if (!position) {
    return <Error statusCode={404} />;
  }

  const { scale, south, east } = position;
  const title = `Mundoko Maps :: ${scale} scale at ${formatFeet(
    east
  )} east and ${formatFeet(south)} south`;

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="Maps of the World of Mundoko – a sword and sorcery setting for fantasy roleplaying adventure games"
        />
        <Favicons />
      </Head>
      <MapViewer position={position} />
    </div>
  );
};

export async function getStaticPaths() {
  const preGeneratedPaths: Array<{ params: PositionParams }> = [
    { params: { scale: "City", east: "5135", south: "5155" } },
  ];

  return {
    paths: preGeneratedPaths,
    fallback: false,
  };
}

export async function getStaticProps(c: GetStaticPropsContext<PositionParams>) {
  const { scale: s, east: e, south: st } = c.params as PositionParams;
  const scale = getScale(s);
  const east = convert(e);
  const south = convert(st);

  return scale && east && south
    ? {
        props: {
          position: {
            scale,
            east,
            south,
          },
        },
      }
    : {
        props: {},
      };
}

export default MapPage;

function convert(s: string) {
  return Number.parseFloat(`0.${s}`) * 1e7;
}

function getScale(s: string): PageScale | null {
  const scales: { [key: string]: PageScale } = {
    extra: "Extra",
    global: "Global",
    state: "State",
    city: "City",
    town: "Town",
    hood: "Hood",
    block: "Block",
    floor: "Floor",
  };
  return scales[s.toLowerCase()] || null;
}

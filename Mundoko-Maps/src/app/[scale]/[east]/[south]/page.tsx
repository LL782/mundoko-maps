import Head from "next/head";
import { MapViewer } from "../../../../MapViewer";
import type { PositionParams } from "../../../../types/PagePosition";
import { formatFeet } from "../../../../UI/formatFeet";

interface Props {
  params: PositionParams;
}

const Page = async ({ params }: Props) => {
  const { scale: s, east: e, south: st } = params;
  const scale = getScale(s);
  const east = convert(e);
  const south = convert(st);

  if (!scale || !east || !south) {
    return null;
  }

  const position = {
    scale,
    east,
    south,
  };

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
      </Head>
      <MapViewer position={position} />
    </div>
  );
};

export default Page;

export async function generateStaticParams() {
  return [{ params: { scale: "city", east: "5135", south: "5155" } }];
}

function convert(s: string) {
  return Math.round(Number.parseFloat(`0.${s}`) * 1e8);
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

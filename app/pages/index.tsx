import type { NextPage } from "next";
import Head from "next/head";
import { MapViewer } from "../MapViewer/MapViewer";
import { Favicons } from "../SiteChrome/Favicons";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Mundoko Maps</title>
        <meta
          name="description"
          content="Maps of the World of Mundoko – a sword and sorcery setting for fantasy roleplaying adventure games"
        />
        <Favicons />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <MapViewer />
    </div>
  );
};

export default Home;

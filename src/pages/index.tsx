import type { NextPage } from "next";
import Head from "next/head";
import { Favicons } from "../SiteChrome/Favicons";
import { ContentsPage } from "../Website/ContentsPage";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Mundoko Maps</title>
        <meta
          name="description"
          content="Maps of the World of Mundoko – a sword and sorcery setting for fantasy roleplaying adventure games"
        />
        <Favicons />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ContentsPage />
    </>
  );
};

export default Home;

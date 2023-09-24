import type { NextPage } from "next";
import Head from "next/head";
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
        <meta name="robots" content="index,follow" />
      </Head>
      <ContentsPage />
    </>
  );
};

export default Home;

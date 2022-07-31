import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Favicons } from "../SiteChrome/Favicons";
import mapImg from "../public/original-map.jpg";

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
      <Image
        alt="Main map"
        layout="responsive"
        placeholder="blur"
        priority={true}
        src={mapImg}
      />
    </div>
  );
};

export default Home;

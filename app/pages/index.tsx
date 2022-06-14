import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
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
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-16x16.png"
          sizes="16x16"
        />
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

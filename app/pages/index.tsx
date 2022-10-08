import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { MapViewer } from "../MapViewer";
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
      <h2>Contents</h2>
      <ol>
        <li>
          <h3>Notes</h3>
          <ol>
            <li>
              <Link href="/map-slice">Map Slice</Link>
            </li>
          </ol>
        </li>
        <li>
          <h3>Maps</h3>
          <ol>
            <li>
              <Link href="/city/5135/5155">Start Here</Link>
            </li>
            <li>
              <Link href="/map-print">Print Test</Link>
            </li>
          </ol>
        </li>
      </ol>
    </div>
  );
};

export default Home;

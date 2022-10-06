import Jimp from "jimp";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const data = req.body;

    const img = await Jimp.read(data);

    img
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write("lena-small-bw.jpg"); // save

    res.status(200).json({ name: "World!" });
  } catch (error) {
    throw error;
  }
}

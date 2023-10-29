import { PagePosition } from "../../../types/PagePosition";

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  return {
    northSouth: {
      points: [
        5150,
        5151,
        5152,
        5153,
        5154,
        pagePosition.south,
        5156,
        5157,
        5158,
        5159,
        5160,
      ],
    },
    westEast: {
      points: [
        5130,
        5131,
        5132,
        5133,
        5134,
        pagePosition.east,
        5136,
        5137,
        5138,
        5139,
        5140,
      ],
    },
  };
};

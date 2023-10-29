import { PagePosition } from "../../../types/PagePosition";

const fourDigitsFrom = (feet: number) =>
  (feet / 10_000).toString().padStart(4, "0");

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  return {
    northSouth: {
      points: [
        "5150",
        "5151",
        "5152",
        "5153",
        "5154",
        fourDigitsFrom(pagePosition.south),
        "5156",
        "5157",
        "5158",
        "5159",
        "5160",
      ],
    },
    westEast: {
      points: [
        "5130",
        "5131",
        "5132",
        "5133",
        "5134",
        fourDigitsFrom(pagePosition.east),
        "5136",
        "5137",
        "5138",
        "5139",
        "5140",
      ],
    },
  };
};

import { PagePosition } from "../../../types/PagePosition";
import { cityScalePointFrom } from "../../../MapUnits/cityScalePointFrom";

const fourDigitStringFrom = (number: number) =>
  number.toString().padStart(4, "0");

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  const centreOnNorthSouthAxis = cityScalePointFrom(pagePosition.south).value;
  const centreOnWestEastAxis = cityScalePointFrom(pagePosition.east).value;

  return {
    northSouth: {
      points: [
        fourDigitStringFrom(centreOnNorthSouthAxis - 5),
        "5151",
        "5152",
        "5153",
        "5154",
        fourDigitStringFrom(centreOnNorthSouthAxis),
        "5156",
        "5157",
        "5158",
        "5159",
        fourDigitStringFrom(centreOnNorthSouthAxis + 5),
      ],
    },
    westEast: {
      points: [
        fourDigitStringFrom(centreOnWestEastAxis - 5),
        "5131",
        "5132",
        "5133",
        "5134",
        fourDigitStringFrom(centreOnWestEastAxis),
        "5136",
        "5137",
        "5138",
        "5139",
        fourDigitStringFrom(centreOnWestEastAxis + 5),
      ],
    },
  };
};

import { PagePosition } from "../../../types/PagePosition";
import { cityScalePointFrom } from "../../../MapUnits/cityScalePointFrom";

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  const centreOnNorthSouthAxis = cityScalePointFrom(pagePosition.south).value;
  const centreOnWestEastAxis = cityScalePointFrom(pagePosition.east).value;

  return {
    northSouth: {
      points: [
        (centreOnNorthSouthAxis - 5).toString().padStart(4, "0"),
        "5151",
        "5152",
        "5153",
        "5154",
        centreOnNorthSouthAxis.toString().padStart(4, "0"),
        "5156",
        "5157",
        "5158",
        "5159",
        (centreOnNorthSouthAxis + 5).toString().padStart(4, "0"),
      ],
    },
    westEast: {
      points: [
        (centreOnWestEastAxis - 5).toString().padStart(4, "0"),
        "5131",
        "5132",
        "5133",
        "5134",
        centreOnWestEastAxis.toString().padStart(4, "0"),
        "5136",
        "5137",
        "5138",
        "5139",
        (centreOnWestEastAxis + 5).toString().padStart(4, "0"),
      ],
    },
  };
};

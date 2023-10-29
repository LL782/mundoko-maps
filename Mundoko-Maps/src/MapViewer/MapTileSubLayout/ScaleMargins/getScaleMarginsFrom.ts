import { PagePosition } from "../../../types/PagePosition";
import { cityScalePointFrom } from "../../../MapUnits/cityScalePointFrom";

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  const centreOnNorthSouthAxis = cityScalePointFrom(pagePosition.south).value;
  const centreOnWestEastAxis = cityScalePointFrom(pagePosition.east).value;

  return {
    northSouth: {
      points: [
        fourDigitStringFrom(centreOnNorthSouthAxis - 5),
        fourDigitStringFrom(centreOnNorthSouthAxis - 4),
        fourDigitStringFrom(centreOnNorthSouthAxis - 3),
        fourDigitStringFrom(centreOnNorthSouthAxis - 2),
        fourDigitStringFrom(centreOnNorthSouthAxis - 1),
        fourDigitStringFrom(centreOnNorthSouthAxis),
        fourDigitStringFrom(centreOnNorthSouthAxis + 1),
        fourDigitStringFrom(centreOnNorthSouthAxis + 2),
        fourDigitStringFrom(centreOnNorthSouthAxis + 3),
        fourDigitStringFrom(centreOnNorthSouthAxis + 4),
        fourDigitStringFrom(centreOnNorthSouthAxis + 5),
      ],
    },
    westEast: {
      points: [
        fourDigitStringFrom(centreOnWestEastAxis - 5),
        fourDigitStringFrom(centreOnWestEastAxis - 4),
        fourDigitStringFrom(centreOnWestEastAxis - 3),
        fourDigitStringFrom(centreOnWestEastAxis - 2),
        fourDigitStringFrom(centreOnWestEastAxis - 1),
        fourDigitStringFrom(centreOnWestEastAxis),
        fourDigitStringFrom(centreOnWestEastAxis + 1),
        fourDigitStringFrom(centreOnWestEastAxis + 2),
        fourDigitStringFrom(centreOnWestEastAxis + 3),
        fourDigitStringFrom(centreOnWestEastAxis + 4),
        fourDigitStringFrom(centreOnWestEastAxis + 5),
      ],
    },
  };
};

function fourDigitStringFrom(number: number) {
  return number.toString().padStart(4, "0");
}

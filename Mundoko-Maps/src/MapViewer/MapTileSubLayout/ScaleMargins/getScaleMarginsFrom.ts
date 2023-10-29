import { PagePosition } from "../../../types/PagePosition";
import { cityScalePointFrom } from "../../../MapUnits/cityScalePointFrom";

export const getScaleMarginsFrom = (pagePosition: PagePosition) => ({
  northSouth: {
    points: [
      fourDigitStringFrom(pagePosition.south - 50_000),
      fourDigitStringFrom(pagePosition.south - 40_000),
      fourDigitStringFrom(pagePosition.south - 30_000),
      fourDigitStringFrom(pagePosition.south - 20_000),
      fourDigitStringFrom(pagePosition.south - 10_000),
      fourDigitStringFrom(pagePosition.south),
      fourDigitStringFrom(pagePosition.south + 10_000),
      fourDigitStringFrom(pagePosition.south + 20_000),
      fourDigitStringFrom(pagePosition.south + 30_000),
      fourDigitStringFrom(pagePosition.south + 40_000),
      fourDigitStringFrom(pagePosition.south + 50_000),
    ],
  },
  westEast: {
    points: [
      fourDigitStringFrom(pagePosition.east - 50_000),
      fourDigitStringFrom(pagePosition.east - 40_000),
      fourDigitStringFrom(pagePosition.east - 30_000),
      fourDigitStringFrom(pagePosition.east - 20_000),
      fourDigitStringFrom(pagePosition.east - 10_000),
      fourDigitStringFrom(pagePosition.east),
      fourDigitStringFrom(pagePosition.east + 10_000),
      fourDigitStringFrom(pagePosition.east + 20_000),
      fourDigitStringFrom(pagePosition.east + 30_000),
      fourDigitStringFrom(pagePosition.east + 40_000),
      fourDigitStringFrom(pagePosition.east + 50_000),
    ],
  },
});

function fourDigitStringFrom(feet: number) {
  return cityScalePointFrom(feet).value.toString().padStart(4, "0");
}

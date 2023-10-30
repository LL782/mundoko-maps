import { PagePosition } from "../../../types/PagePosition";
import { feetToMapPoint } from "../../../MapUnits/feetToMapPoint";

const EMPTY_RESPONSE = {
  northSouth: { points: ["0"] },
  westEast: { points: ["0"] },
};

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  if (pagePosition.scale === "State") {
    return {
      northSouth: {
        points: [
          statePoint(pagePosition.south - 1_000_000),
          statePoint(pagePosition.south - 800_000),
          statePoint(pagePosition.south - 600_000),
          statePoint(pagePosition.south - 400_000),
          statePoint(pagePosition.south - 200_000),
          statePoint(pagePosition.south),
          statePoint(pagePosition.south + 200_000),
          statePoint(pagePosition.south + 400_000),
          statePoint(pagePosition.south + 600_000),
          statePoint(pagePosition.south + 800_000),
          statePoint(pagePosition.south + 1_000_000),
        ],
      },
      westEast: {
        points: [
          statePoint(pagePosition.east - 1_000_000),
          statePoint(pagePosition.east - 800_000),
          statePoint(pagePosition.east - 600_000),
          statePoint(pagePosition.east - 400_000),
          statePoint(pagePosition.east - 200_000),
          statePoint(pagePosition.east),
          statePoint(pagePosition.east + 200_000),
          statePoint(pagePosition.east + 400_000),
          statePoint(pagePosition.east + 600_000),
          statePoint(pagePosition.east + 800_000),
          statePoint(pagePosition.east + 1_000_000),
        ],
      },
    };
  }

  if (pagePosition.scale === "City") {
    return {
      northSouth: {
        points: [
          cityPoint(pagePosition.south - 50_000),
          cityPoint(pagePosition.south - 40_000),
          cityPoint(pagePosition.south - 30_000),
          cityPoint(pagePosition.south - 20_000),
          cityPoint(pagePosition.south - 10_000),
          cityPoint(pagePosition.south),
          cityPoint(pagePosition.south + 10_000),
          cityPoint(pagePosition.south + 20_000),
          cityPoint(pagePosition.south + 30_000),
          cityPoint(pagePosition.south + 40_000),
          cityPoint(pagePosition.south + 50_000),
        ],
      },
      westEast: {
        points: [
          cityPoint(pagePosition.east - 50_000),
          cityPoint(pagePosition.east - 40_000),
          cityPoint(pagePosition.east - 30_000),
          cityPoint(pagePosition.east - 20_000),
          cityPoint(pagePosition.east - 10_000),
          cityPoint(pagePosition.east),
          cityPoint(pagePosition.east + 10_000),
          cityPoint(pagePosition.east + 20_000),
          cityPoint(pagePosition.east + 30_000),
          cityPoint(pagePosition.east + 40_000),
          cityPoint(pagePosition.east + 50_000),
        ],
      },
    };
  }

  return EMPTY_RESPONSE;
};

function statePoint(feet: number) {
  return feetToMapPoint(feet).value.toString().padStart(3, "0");
}

function cityPoint(feet: number) {
  return feetToMapPoint(feet).value.toString().padStart(4, "0");
}

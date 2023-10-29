import { PagePosition } from "../../../types/PagePosition";

export const getScaleMarginsFrom = (pagePosition: PagePosition) => {
  return {
    northSouth: { points: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    westEast: { points: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  };
};

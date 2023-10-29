import { PagePosition } from "../../../types/PagePosition";
import { getScaleMarginsFrom } from "./getScaleMarginsFrom";

const testPosition: PagePosition = { scale: "City", east: 1, south: 1 };

describe('for "city" scale', () => {
  beforeEach(() => {
    testPosition.scale = "City";
  });

  it("renders 11 points per margin", () => {
    const result = getScaleMarginsFrom(testPosition);
    expect(result.northSouth.points.length).toBe(11);
    expect(result.westEast.points.length).toBe(11);
  });
});

import { PagePosition } from "../../../types/PagePosition";
import { getScaleMarginsFrom } from "./getScaleMarginsFrom";

let testPosition: PagePosition = {} as any;
let result: ReturnType<typeof getScaleMarginsFrom>;
let northSouthPoints: string[];
let westEastPoints: string[];

describe("given placeholder page position", () => {
  beforeEach(() => {
    testPosition = {
      scale: "City",
      east: 51_350_000,
      south: 51_550_000,
    };

    result = getScaleMarginsFrom(testPosition);
    northSouthPoints = result.northSouth.points;
    westEastPoints = result.westEast.points;
  });

  it("returns 11 points per margin", () => {
    expect(northSouthPoints.length).toBe(11);
    expect(westEastPoints.length).toBe(11);
  });

  test("points are four digit strings", () => {
    northSouthPoints.forEach((p) => expect(p.length).toBe(4));
    westEastPoints.forEach((p) => expect(p.length).toBe(4));
  });

  test("input East and South are the central points", () => {
    const middleIndex1 = Math.round(northSouthPoints.length / 2) - 1;
    const middleIndex2 = Math.round(westEastPoints.length / 2) - 1;

    expect(northSouthPoints[middleIndex1]).toBe("5155");
    expect(westEastPoints[middleIndex2]).toBe("5135");
  });
});

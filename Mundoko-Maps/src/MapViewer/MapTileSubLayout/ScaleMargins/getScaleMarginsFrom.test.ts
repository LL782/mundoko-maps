import { PagePosition } from "../../../types/PagePosition";
import { getScaleMarginsFrom } from "./getScaleMarginsFrom";

let testPosition: PagePosition = {} as any;
let result: ReturnType<typeof getScaleMarginsFrom>;
let northSouthPoints: number[];
let westEastPoints: number[];

describe("given placeholder page position", () => {
  beforeEach(() => {
    testPosition = { scale: "City", east: 5135, south: 5155 };
    result = getScaleMarginsFrom(testPosition);
    northSouthPoints = result.northSouth.points;
    westEastPoints = result.westEast.points;
  });

  it("returns 11 points per margin", () => {
    expect(northSouthPoints.length).toBe(11);
    expect(westEastPoints.length).toBe(11);
  });

  test("input East and South return as central points", () => {
    const middleIndex1 = Math.round(northSouthPoints.length / 2) - 1;
    const middleIndex2 = Math.round(westEastPoints.length / 2) - 1;

    expect(northSouthPoints[middleIndex1]).toBe(testPosition.south);
    expect(westEastPoints[middleIndex2]).toBe(testPosition.east);
  });
});

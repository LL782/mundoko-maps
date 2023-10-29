import { PagePosition } from "../../../types/PagePosition";
import { getScaleMarginsFrom } from "./getScaleMarginsFrom";

let testPosition: PagePosition = {} as any;
let result: ReturnType<typeof getScaleMarginsFrom>;
let northSouthPoints: string[];
let westEastPoints: string[];

describe("given page position city/1000/2000", () => {
  beforeEach(() => {
    testPosition = {
      scale: "City",
      east: 10_000_000,
      south: 20_000_000,
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

  test("input East and South are central points", () => {
    const middleIndex1 = Math.round(northSouthPoints.length / 2) - 1;
    const middleIndex2 = Math.round(westEastPoints.length / 2) - 1;

    expect(northSouthPoints[middleIndex1]).toBe("2000");
    expect(westEastPoints[middleIndex2]).toBe("1000");
  });

  test("North West corner is 50,000' North and 50,000' West of centre", () => {
    expect(northSouthPoints.shift()).toBe("1995");
    expect(westEastPoints.shift()).toBe("0995");
  });

  test("South East corner is 50,000' South and 50,000' East of centre", () => {
    expect(northSouthPoints.pop()).toBe("2005");
    expect(westEastPoints.pop()).toBe("1005");
  });
});

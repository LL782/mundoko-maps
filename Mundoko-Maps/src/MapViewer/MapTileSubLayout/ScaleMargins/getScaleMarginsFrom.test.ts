import { PagePosition } from "../../../types/PagePosition";
import { getScaleMarginsFrom } from "./getScaleMarginsFrom";

let testPosition: PagePosition = {} as any;
let result: ReturnType<typeof getScaleMarginsFrom>;
let northSouthPoints: string[];
let westEastPoints: string[];

const setupFor = (pagePosition: PagePosition) => {
  result = getScaleMarginsFrom(pagePosition);
  northSouthPoints = result.northSouth.points;
  westEastPoints = result.westEast.points;
};

describe("given City scale", () => {
  beforeEach(() => {
    setupFor({
      scale: "City",
      east: 50_000,
      south: 50_000,
    });
  });

  test("11 points are set for each margin", () => {
    expect(northSouthPoints.length).toBe(11);
    expect(westEastPoints.length).toBe(11);
  });

  test("points are four digit strings", () => {
    northSouthPoints.forEach((p) => expect(p.length).toBe(4));
    westEastPoints.forEach((p) => expect(p.length).toBe(4));
  });

  test("East and South from page position are used for centre", () => {
    const middleIndex1 = Math.round(northSouthPoints.length / 2) - 1;
    const middleIndex2 = Math.round(westEastPoints.length / 2) - 1;

    expect(northSouthPoints[middleIndex1]).toBe("0005");
    expect(westEastPoints[middleIndex2]).toBe("0005");
  });

  test("North-West corner is 50,000' North and 50,000' West of centre", () => {
    expect(northSouthPoints.shift()).toBe("0000");
    expect(westEastPoints.shift()).toBe("0000");
  });

  test("South-East corner is 50,000' South and 50,000' East of centre", () => {
    expect(northSouthPoints.pop()).toBe("0010");
    expect(westEastPoints.pop()).toBe("0010");
  });
});

describe("give page position city/1000/2000", () => {
  beforeEach(() => {
    setupFor({
      scale: "City",
      east: 10_000_000,
      south: 20_000_000,
    });
  });

  test("all the points a calculated correctly", () => {
    expect(northSouthPoints).toEqual([
      "1995",
      "1996",
      "1997",
      "1998",
      "1999",
      "2000",
      "2001",
      "2002",
      "2003",
      "2004",
      "2005",
    ]);

    expect(westEastPoints).toEqual([
      "0995",
      "0996",
      "0997",
      "0998",
      "0999",
      "1000",
      "1001",
      "1002",
      "1003",
      "1004",
      "1005",
    ]);
  });
});

describe("given a page position on edge of world", () => {
  beforeEach(() => {
    setupFor({
      scale: "City",
      east: 10_000,
      south: 1,
    });
  });

  test("points loop around edge of world", () => {
    expect(northSouthPoints).toEqual([
      "9995",
      "9996",
      "9997",
      "9998",
      "9999",
      "0000",
      "0001",
      "0002",
      "0003",
      "0004",
      "0005",
    ]);

    expect(westEastPoints).toEqual([
      "9996",
      "9997",
      "9998",
      "9999",
      "0000",
      "0001",
      "0002",
      "0003",
      "0004",
      "0005",
      "0006",
    ]);
  });
});

import { PagePosition } from "../../../types/PagePosition";

describe('for "city" scale', () => {
  const testPosition: PagePosition = { scale: "City", east: 1, south: 1 };
  it("renders 11 points per margin", () => {
    const result = positionToScaleMargins(testPosition);
    expect(result.northSouth.points.length).toBe(11);
    expect(result.westEast.points.length).toBe(11);
  });
});

function positionToScaleMargins(testPosition: PagePosition) {
  return {
    northSouth: { points: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    westEast: { points: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  };
}

import { render, screen } from "@testing-library/react";
import { MapTile } from "./MapTile";
import { PagePosition } from "../../../types/PagePosition";

const matchingPosition = {
  scale: "City",
  east: 51350000,
  south: 51550000,
};

describe("Given a position that matches an existing tile image", () => {
  beforeEach(() => {
    render(<MapTile position={{ ...matchingPosition } as PagePosition} />);
  });

  it("renders that image", () => {
    expect(screen.getAllByRole("img").length).toBe(1);
  });
});

describe("Given the position one scale above does not match an existing tile", () => {
  beforeEach(() => {
    render(
      <MapTile
        position={
          {
            ...matchingPosition,
            scale: "State",
          } as PagePosition
        }
      />
    );
  });

  it("the view is generated from a portion of the tile above and one image for each tile below", () => {
    expect(screen.getAllByRole("img").length).toBe(401);
  });
});

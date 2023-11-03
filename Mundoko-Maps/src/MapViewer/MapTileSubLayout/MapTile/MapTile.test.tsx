import { render, screen } from "@testing-library/react";
import { MapTile } from "./MapTile";
import { PagePosition } from "../../../types/PagePosition";

describe("Given a position that matches an existing map tile image", () => {
  beforeEach(() => {
    const position = {
      scale: "City",
      east: 51350000,
      south: 51550000,
    } as PagePosition;
    render(<MapTile position={position} />);
  });

  it("renders that image", () => {
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});

import { fourDigitsFrom } from "./fourDigitsFrom";

test.each([
  {
    input: 10_000_000,
    output: "1000",
  },
  {
    input: 20_000_000,
    output: "2000",
  },
])("Converts $input to $output", ({ input, output }) => {
  expect(fourDigitsFrom(input)).toBe(output);
});

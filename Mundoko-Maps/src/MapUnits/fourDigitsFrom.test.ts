import { fourDigitsFrom } from "./fourDigitsFrom";

test.each([
  {
    input: 0,
    output: "0000",
  },
  {
    input: 4_999,
    output: "0000",
  },
  {
    input: 5_000,
    output: "0001",
  },
  {
    input: 10_000,
    output: "0001",
  },
  {
    input: 14_999,
    output: "0001",
  },
  {
    input: 15_000,
    output: "0002",
  },
  {
    input: 10_000_000,
    output: "1000",
  },
  {
    input: 20_000_000,
    output: "2000",
  },
  {
    input: 99_994_999,
    output: "9999",
  },
  {
    input: 99_995_000,
    output: "0000",
  },
  {
    input: 100_004_999,
    output: "0000",
  },
  {
    input: 100_005_000,
    output: "0001",
  },
  {
    input: 199_995_000,
    output: "0000",
  },
  {
    input: -5_000,
    output: "0000",
  },
  {
    input: -5_001,
    output: "9999",
  },
  {
    input: -100_005_001,
    output: "9999",
  },
])('Converts $input to "$output"', ({ input, output }) => {
  expect(fourDigitsFrom(input)).toBe(output);
});

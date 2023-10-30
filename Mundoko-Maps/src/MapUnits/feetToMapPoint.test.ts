import { feetToMapPoint } from "./feetToMapPoint";

test.each([
  {
    input: 0,
    output: 0,
  },
  {
    input: 4_999,
    output: 0,
  },
  {
    input: 5_000,
    output: 1,
  },
  {
    input: 10_000,
    output: 1,
  },
  {
    input: 14_999,
    output: 1,
  },
  {
    input: 15_000,
    output: 2,
  },
  {
    input: 10_000_000,
    output: 1_000,
  },
  {
    input: 20_000_000,
    output: 2_000,
  },
  {
    input: 99_994_999,
    output: 9_999,
  },
  {
    input: 99_995_000,
    output: 0,
  },
  {
    input: 100_004_999,
    output: 0,
  },
  {
    input: 100_005_000,
    output: 1,
  },
  {
    input: 199_995_000,
    output: 0,
  },
  {
    input: -5_000,
    output: 0,
  },
  {
    input: -5_001,
    output: 9_999,
  },
  {
    input: -100_005_001,
    output: 9_999,
  },
])("Converts $input to $output", ({ input, output }) => {
  expect(feetToMapPoint(input).value).toBe(output);
});

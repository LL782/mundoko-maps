const MAP_SIZE = 100_000_000;

const FIDELITY = {
  Extra: 1,
  Global: 1,
  State: 100_000,
  City: 10_000,
  Town: 1,
  Hood: 1,
  Block: 1,
  Floor: 1,
} as const;

class MapPoint {
  number: number;
  fidelity: number;
  loopPoint: number;

  constructor(number: number, scale: PageScale) {
    this.number = number;
    this.fidelity = FIDELITY[scale];
    this.loopPoint = MAP_SIZE / this.fidelity;
  }

  reduceFidelity = () => {
    this.number = Math.round(this.number / this.fidelity);
    return this;
  };

  loopNumbersAboveMax = () => {
    if (this.number >= this.loopPoint) {
      this.number = this.number % this.loopPoint;
    }
    return this;
  };

  loopNumbersBelowZero = () => {
    if (this.number < 0) {
      this.number = this.loopPoint + (this.number % this.loopPoint);
    }
    return this;
  };

  toString = () => this.number.toString();

  public get value() {
    if (this.number === -0) {
      return 0;
    }
    return this.number;
  }
}

export const feetToMapPoint = (feet: number, scale: PageScale) =>
  new MapPoint(feet, scale)
    .reduceFidelity()
    .loopNumbersAboveMax()
    .loopNumbersBelowZero();

import { Decimal } from "decimal.js";
// Backend Decimal has 28 significant digits. Keep ample room for summing all
// components without converting API strings to binary floating-point numbers.
const Money = Decimal.clone({ precision: 256, rounding: Decimal.ROUND_HALF_UP });
export function decimal(value: unknown): string {
  if (typeof value !== "string" || value.length > 100 || !/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) throw new Error("Expected a decimal string");
  const n = new Money(value);
  if (!n.isFinite() || Math.abs(n.e) > 50) throw new Error("Decimal out of range");
  return value;
}
export function addMoney(values: string[]): string {
  return values.reduce((sum, value) => sum.plus(decimal(value)), new Money(0)).toFixed();
}
export function usd(value: string | null): string {
  if (value === null) return "—";
  const n = new Money(decimal(value));
  const [whole, cents] = n.abs().toFixed(2).split(".");
  return `${n.isNegative() && !n.toDecimalPlaces(2).isZero() ? "-" : ""}$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${cents}`;
}

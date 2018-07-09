export function nOf<T>(n: number, x: T): T[] {

  let o: T[] = [];
  for (let i = 0; i < n; i++) {
    o.push(x);
  }
  return o;

}
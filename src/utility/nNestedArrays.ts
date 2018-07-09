export function nNestedArrays<T>(n: number): ((T)[])[] {

  let o = [];
  for (let i = 0; i < n; i++) {
    o.push([]);
  }
  return o;

};
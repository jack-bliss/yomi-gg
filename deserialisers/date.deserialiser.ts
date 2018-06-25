export const DateDeserialiser = (input: string | number | Date): Date => {

  if (input instanceof Date) {
    return input;
  } else if (typeof input === 'number') {
    return new Date(input);
  } else if (typeof input === 'string') {
    if (String(parseInt(input)) === input) {
      return new Date(parseInt(input));
    } else {
      return new Date(input);
    }
  }

}
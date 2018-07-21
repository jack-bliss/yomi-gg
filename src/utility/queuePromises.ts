export const queuePromises = <T>(promises: Promise<T>[]): Promise<T> => {
  const factories = promises.map(p => () => p);
  const first = factories.shift();
  return factories.reduce((chain: Promise<T>, next) => {
    return chain.then(next);
  }, first());
};
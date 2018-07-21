export const queuePromiseFactories = <T>(factories: (() => Promise<T>)[]): Promise<T> => {
  const first = factories.shift();
  return factories.reduce((chain: Promise<T>, next) => {
    return chain.then(next);
  }, first());
};
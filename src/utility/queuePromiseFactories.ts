export const queuePromiseFactories = <T>(factories: (() => Promise<T>)[]): Promise<T> => {
  if (factories.length === 0) {
    return Promise.resolve(null);
  } else if (factories.length === 1) {
    return factories[0]();
  }
  const first = factories.shift();
  return factories.reduce((chain: Promise<T>, next) => {
    return chain.then(next);
  }, first());
};
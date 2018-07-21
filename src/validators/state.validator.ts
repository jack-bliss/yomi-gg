export const StateValidator: (state: string) => boolean = (state: string): boolean => {

  return (state === 'pending' || state === 'in progress' || state === 'complete');

};
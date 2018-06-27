export const PasswordValidator = (password: string): boolean => {

  return typeof password === 'string' && password.length > 6;

};

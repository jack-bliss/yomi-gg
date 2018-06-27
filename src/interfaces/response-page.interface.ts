export interface ResponsePage<T> {

  page: T[];
  total: number;
  more: boolean;

}
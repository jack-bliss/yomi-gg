export interface SmashggResponse<T> {
  entities: T;
  result: number;
  resultEntity: string;
  actionRecords: any[];
}
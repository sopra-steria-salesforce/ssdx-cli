export interface Config {
  status: number;
  result: Result[];
  warnings: any[];
}

export interface Result {
  name: string;
  key: string;
  value: string;
  path: string;
  success: boolean;
  location: string;
}

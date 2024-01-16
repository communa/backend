export interface ITime {
  id?: string;
  note: string | null;
  keyboardKeys: number;
  mouseKeys: number;
  mouseDistance: number;
  fromAt: Date;
  toAt: Date;
  activity?: {
    id: string;
  };
}

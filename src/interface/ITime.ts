export interface ITime {
  id?: string;
  note: string | null;
  minutesActive: number;
  keyboardKeys: number;
  mouseKeys: number;
  mouseDistance: number;
  fromAt: Date;
  toAt: Date;
  activity?: {
    id: string;
  };
}

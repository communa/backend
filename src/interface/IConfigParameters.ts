export interface IConfigParameters {
  host: string;
  port: number;
  sentry: string;
  substrate: string;
  jwtSecret: string;
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

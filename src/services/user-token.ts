export interface Token {
  readonly scope: string;
  readonly uid?: string;
  readonly iss?: string;
  readonly exp?: number;
}

export interface UserToken extends Token {
  // exp: number;
  nodered?: string;
}

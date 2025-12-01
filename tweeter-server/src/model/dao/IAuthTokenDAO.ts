import { AuthToken } from "tweeter-shared";

export interface IAuthTokenDAO {
  putToken(token: AuthToken, userAlias: string): Promise<void>;

  getToken(token: string): Promise<string | null>;

  getTokenData(token: string): Promise<{ userAlias: string; timestamp: number } | null>;

  deleteToken(token: string): Promise<void>;
}


import { User } from "tweeter-shared";

export interface IUserDAO {
  getUser(alias: string): Promise<User | null>;

  putUser(user: User): Promise<void>;

  login(alias: string, password: string): Promise<User | null>;

  register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string
  ): Promise<User>;
}


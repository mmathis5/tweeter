import { User } from "tweeter-shared";

export interface IUserDAO {
  getUser(alias: string): Promise<User | null>;

  putUser(user: User): Promise<void>;

  getUserWithPasswordHash(alias: string): Promise<{ user: User; passwordHash: string } | null>;

  putUserWithPasswordHash(
    firstName: string,
    lastName: string,
    alias: string,
    passwordHash: string,
    imageUrl: string
  ): Promise<User>;

  incrementFollowerCount(alias: string): Promise<void>;

  decrementFollowerCount(alias: string): Promise<void>;

  incrementFolloweeCount(alias: string): Promise<void>;

  decrementFolloweeCount(alias: string): Promise<void>;
}


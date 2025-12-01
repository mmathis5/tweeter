import { UserDto } from "tweeter-shared";

export interface IFollowDAO {
  getFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeAlias: string | null
  ): Promise<[UserDto[], boolean]>;

  getFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | null
  ): Promise<[UserDto[], boolean]>;

  isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;

  getFolloweeCount(followerAlias: string): Promise<number>;

  getFollowerCount(followeeAlias: string): Promise<number>;

  follow(followerAlias: string, followeeAlias: string): Promise<void>;

  unfollow(followerAlias: string, followeeAlias: string): Promise<void>;
}


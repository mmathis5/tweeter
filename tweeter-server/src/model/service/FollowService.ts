import { User, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/DAOFactory";

export class FollowService extends Service {
  constructor(daoFactory: DAOFactory) {
    super(daoFactory);
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      // Get followee aliases from FollowDAO
      const [followeeAliases, hasMore] = await daoFactory.getFollowDAO().getFolloweeAliases(
        userAlias,
        pageSize,
        lastItem?.alias ?? null
      );

      // Fetch user data for each followee alias (service layer responsibility)
      const followees: UserDto[] = [];
      for (const alias of followeeAliases) {
        const user = await daoFactory.getUserDAO().getUser(alias);
        if (user) {
          followees.push(user.dto);
        }
      }

      return [followees, hasMore];
    });
  };

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      // Get follower aliases from FollowDAO
      const [followerAliases, hasMore] = await daoFactory.getFollowDAO().getFollowerAliases(
        userAlias,
        pageSize,
        lastItem?.alias ?? null
      );

      // Fetch user data for each follower alias (service layer responsibility)
      const followers: UserDto[] = [];
      for (const alias of followerAliases) {
        const user = await daoFactory.getUserDAO().getUser(alias);
        if (user) {
          followers.push(user.dto);
        }
      }

      return [followers, hasMore];
    });
  };

  public async getIsFollowerStatus(
    token: string,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getFollowDAO().isFollower(user.alias, selectedUser.alias);
    });

  };

  public async getFolloweeCount(
    token: string,
    user: User
  ): Promise<number> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getFollowDAO().getFolloweeCount(user.alias) ?? 0;
    });
  };

  public async getFollowerCount(
    token: string,
    user: User
  ): Promise<number> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getFollowDAO().getFollowerCount(user.alias) ?? 0;
    });
  };


  public async follow(
    token: string,
    currentUser: User,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      // Create follow relationship (FollowDAO only works with Follows table)
      await daoFactory.getFollowDAO().follow(currentUser.alias, userToFollow.alias);

      // Update counts in Users table (service layer responsibility)
      await daoFactory.getUserDAO().incrementFollowerCount(userToFollow.alias);
      await daoFactory.getUserDAO().incrementFolloweeCount(currentUser.alias);

      // Get the updated counts for the user being followed
      const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToFollow.alias) ?? 0;
      const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToFollow.alias) ?? 0;

      return [followerCount, followeeCount];
    });
  };



  public async unfollow(
    token: string,
    currentUser: User,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      // Remove follow relationship (FollowDAO only works with Follows table)
      await daoFactory.getFollowDAO().unfollow(currentUser.alias, userToUnfollow.alias);

      // Update counts in Users table (service layer responsibility)
      await daoFactory.getUserDAO().decrementFollowerCount(userToUnfollow.alias);
      await daoFactory.getUserDAO().decrementFolloweeCount(currentUser.alias);

      // Get the updated counts for the user being unfollowed
      const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToUnfollow.alias) ?? 0;
      const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToUnfollow.alias) ?? 0;

      return [followerCount, followeeCount];
    });
  };

}
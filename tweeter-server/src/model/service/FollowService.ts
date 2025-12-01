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
      return await daoFactory.getFollowDAO().getFollowees(userAlias, pageSize, lastItem?.alias ?? null);
    });

  };

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getFollowDAO().getFollowers(userAlias, pageSize, lastItem?.alias ?? null);
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
      await daoFactory.getFollowDAO().follow(currentUser.alias, userToFollow.alias);

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
      await daoFactory.getFollowDAO().unfollow(currentUser.alias, userToUnfollow.alias);

      // Get the updated counts for the user being followed
      const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToUnfollow.alias) ?? 0;
      const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToUnfollow.alias) ?? 0;

      return [followerCount, followeeCount];
    });
  };

}
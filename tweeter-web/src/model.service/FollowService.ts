import { User, AuthToken, FakeData, PagedUserItemRequest, FollowerStatusRequest, FollowServiceGeneralRequest } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../network/ServerFacade";

export class FollowService extends Service {

  
  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {

    const request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null
    };
    return this.serverFacade.getMoreFollowees(request);
  };

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null
    };
    return this.serverFacade.getMoreFollowers(request);
  };



  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const request: FollowerStatusRequest = {
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto
    };
    return this.serverFacade.getIsFollowerStatus(request);

  };

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
    ): Promise<number> {
    const request: FollowServiceGeneralRequest = {
      token: authToken.token,
      user: user.dto
    };
    return this.serverFacade.getFolloweeCount(request);
  };

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowServiceGeneralRequest = {
      token: authToken.token,
      user: user.dto
    };
    return this.serverFacade.getFollowerCount(request);
  };


  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: FollowServiceGeneralRequest = {
      token: authToken.token,
      user: userToFollow.dto
    };
    return this.serverFacade.follow(request);

    //TODO: Remove this when you're sure that all you needed to do here was call the server
    // const followerCount = await this.getFollowerCount(authToken, userToFollow);
    // const followeeCount = await this.getFolloweeCount(authToken, userToFollow);

    // return [followerCount, followeeCount];
  };



  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    
    const request: FollowServiceGeneralRequest = {
      token: authToken.token,
      user: userToUnfollow.dto
    };
    return this.serverFacade.unfollow(request);
    
    //TODO: Remove this when you're sure that all you needed to do here was call the server
    // const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
    // const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);

    // return [followerCount, followeeCount];
  };



}


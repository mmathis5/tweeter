import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  User,
  Status,
  AuthToken,
  FollowerStatusRequest,
  FollowerStatusResponse,
  FollowServiceGeneralRequest,
  CountResponse,
  FollowAndUnfollowResponse,
  StatusLoadMoreRequest,
  StatusLoadMoreResponse,
  PostStatusRequest,
  TweeterResponse,
  RegisterRequest,
  LoginAndRegsiterResponse,
  LoginRequest,
  LogoutRequest,
  GetUserResponse,
  GetUserRequest
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL = "https://xqbwyuuleg.execute-api.us-west-2.amazonaws.com/dev";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/list/followees");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/list/followers");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No followers found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getIsFollowerStatus(
    request: FollowerStatusRequest
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      FollowerStatusRequest,
      FollowerStatusResponse
    >(request, "/follow/get/isFollower");

      // Handle errors    
      if (response.success) {
        return response.isFollower;
      } else {
        console.error(response);
        throw new Error(response.message ?? undefined);
      } 
  }

  public async getFolloweeCount(
    request: FollowServiceGeneralRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      FollowServiceGeneralRequest,
      CountResponse
    >(request, "/follow/get/followeeCount");
    // Handle errors    
    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } 
  }

  public async getFollowerCount(
    request: FollowServiceGeneralRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      FollowServiceGeneralRequest,
      CountResponse
    >(request, "/follow/get/followerCount");
    // Handle errors    
    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } 
  }

  public async follow(
    request: FollowServiceGeneralRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      FollowServiceGeneralRequest,
      FollowAndUnfollowResponse
    >(request, "/follow/follow");
    // Handle errors    
    if (response.success) {
      return [response.followerCount, response.followeeCount];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } 
  }

  public async unfollow(
    request: FollowServiceGeneralRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      FollowServiceGeneralRequest,
      FollowAndUnfollowResponse
    >(request, "/follow/unfollow");
    // Handle errors    
    if (response.success) {
      return [response.followerCount, response.followeeCount];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    } 
  }

  public async loadMoreFeedItems(
    request: StatusLoadMoreRequest
  ): Promise<[Status[], boolean]>{
    const response = await this.clientCommunicator.doPost<
      StatusLoadMoreRequest,
      StatusLoadMoreResponse
    >(request, "/status/load/feedItems");

    // Convert the StatusDTO array returned by ClientCommunicator to a User array
    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;
    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No feed items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async loadMoreStoryItems(
    request: StatusLoadMoreRequest
  ): Promise<[Status[], boolean]>{
    const response = await this.clientCommunicator.doPost<
      StatusLoadMoreRequest,
      StatusLoadMoreResponse
    >(request, "/status/load/storyItems");

    // Convert the StatusDTO array returned by ClientCommunicator to a User array
    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;
    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No feed items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async postStatus(
    request: PostStatusRequest
  ): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      PostStatusRequest,
      TweeterResponse
    >(request, "/status/post");
    // Handle errors    
    if (response.success) {
      return;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async register(
    request: RegisterRequest
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      LoginAndRegsiterResponse
    >(request, "/user/register");
    // Handle errors    
    if (response.success) {
      return [User.fromDto(response.user)!, AuthToken.fromDto(response.token)];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async login(
    request: LoginRequest
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      LoginAndRegsiterResponse
    >(request, "/user/login");
    // Handle errors    
    if (response.success) {
      return [User.fromDto(response.user)!, AuthToken.fromDto(response.token)];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async logout(
    request: LogoutRequest
  ): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      LogoutRequest,
      TweeterResponse
    >(request, "/user/logout");
    // Handle errors    
    if (response.success) {
      return;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getUser(
    request: GetUserRequest
  ): Promise<User> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(request, "/user/get");
    // Handle errors    
    if (response.success) {
      return User.fromDto(response.user)!;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }


}
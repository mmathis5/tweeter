import { AuthToken, FakeData, PostStatusRequest, Status, StatusLoadMoreRequest } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService extends Service {
  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: StatusLoadMoreRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null
    };
    return this.serverFacade.loadMoreFeedItems(request);
  };

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: StatusLoadMoreRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem?.dto ?? null
    };
    return this.serverFacade.loadMoreStoryItems(request);
  };

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    const request: PostStatusRequest = {
      token: authToken.token,
      status: newStatus
    };
    return this.serverFacade.postStatus(request);
  };


}
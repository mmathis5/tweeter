import { FakeData, Status, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/DAOFactory";

export class StatusService extends Service {
  constructor(daoFactory: DAOFactory) {
    super(daoFactory);
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getStatusDAO().getFeed(userAlias, pageSize, lastItem?.timestamp ?? null);
    });
  };

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,  
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getStatusDAO().getStory(userAlias, pageSize, lastItem?.timestamp ?? null);
    });
  };

  public async postStatus(
    token: string,
    newStatus: Status
  ): Promise<void> {    
    return await this.doWithDAOFactory(async (daoFactory) => {
      const user = await daoFactory.getUserDAO().getUser(newStatus.user.alias);
      if (!user) {
        throw new Error("Bad Request: User not found");
      }      
      const statusWithOriginalUrl = new Status(
        newStatus.post,
        user,
        newStatus.timestamp
      );
      
      // Post status to Stories table (DAO handles only data access)
      await daoFactory.getStatusDAO().postStatus(statusWithOriginalUrl);

      // Business logic: Get all followers and add status to their feeds
      const followerAliases = await this.getAllFollowerAliases(daoFactory, user.alias);

      // Add status to each follower's feed
      const feedPromises = followerAliases.map(followerAlias => 
        daoFactory.getStatusDAO().addStatusToFeed(followerAlias, statusWithOriginalUrl)
      );

      await Promise.all(feedPromises);
    });
  };

  private async getAllFollowerAliases(daoFactory: DAOFactory, followeeAlias: string): Promise<string[]> {
    // Get all followers by paginating through results
    const followerAliases: string[] = [];
    let lastFollowerAlias: string | null = null;
    const pageSize = 100;

    do {
      const [followers, hasMore] = await daoFactory.getFollowDAO().getFollowerAliases(
        followeeAlias,
        pageSize,
        lastFollowerAlias
      );
      followerAliases.push(...followers);
      lastFollowerAlias = hasMore && followers.length > 0 ? followers[followers.length - 1] : null;
    } while (lastFollowerAlias !== null);

    return followerAliases;
  }

  private async getFakeData(lastItem: StatusDto | null, pageSize: number): Promise<[StatusDto[], boolean]>  {
    const [items, hasMore] = FakeData.instance.getPageOfStatuses(Status.fromDto(lastItem), pageSize);
    const dtos = items.map((status) => status.dto);
    return [dtos, hasMore];
  }

}
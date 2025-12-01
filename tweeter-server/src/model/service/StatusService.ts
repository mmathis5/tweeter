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
      
      return await daoFactory.getStatusDAO().postStatus(statusWithOriginalUrl);
    });
  };

  private async getFakeData(lastItem: StatusDto | null, pageSize: number): Promise<[StatusDto[], boolean]>  {
    const [items, hasMore] = FakeData.instance.getPageOfStatuses(Status.fromDto(lastItem), pageSize);
    const dtos = items.map((status) => status.dto);
    return [dtos, hasMore];
  }

}
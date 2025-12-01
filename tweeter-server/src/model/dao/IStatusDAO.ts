import { Status, StatusDto } from "tweeter-shared";

export interface IStatusDAO {
  getFeed(
    userAlias: string,
    pageSize: number,
    lastStatusTimestamp: number | null
  ): Promise<[StatusDto[], boolean]>;

  getStory(
    userAlias: string,
    pageSize: number,
    lastStatusTimestamp: number | null
  ): Promise<[StatusDto[], boolean]>;

  postStatus(status: Status): Promise<void>;
}


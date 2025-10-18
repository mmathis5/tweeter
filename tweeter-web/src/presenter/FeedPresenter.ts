import { AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { StatusPresenter } from "./StatusPresenter";
import { PAGE_SIZE, PagedItemView } from "./PagedItemPresenter";

export class FeedPresenter extends StatusPresenter{    
    protected itemDescription(): string {
        return "load feed items";
    }
    protected getMoreItems(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
        return this.service.loadMoreFeedItems(authToken, userAlias, PAGE_SIZE, this.lastItem);
    }
}
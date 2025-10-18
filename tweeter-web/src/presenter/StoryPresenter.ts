import { AuthToken, Status } from "tweeter-shared";
import { StatusPresenter } from "./StatusPresenter";
import { PAGE_SIZE } from "./PagedItemPresenter";

export class StoryPresenter extends StatusPresenter{
    protected itemDescription(): string {
        return "load story items";
    }
    protected getMoreItems(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
        return this.service.loadMoreStoryItems(authToken, userAlias, PAGE_SIZE, this.lastItem);
    }
}
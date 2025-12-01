import { PagedUserItemRequest } from "tweeter-shared";
import { PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: PagedUserItemRequest, daoFactory: DynamoDBFactory): Promise<PagedUserItemResponse> => {
    const followService = new FollowService(daoFactory);
    const [items, hasMore] = await followService.loadMoreFollowers(request.token, request.userAlias, request.pageSize, request.lastItem);
    return {
        success: true,
        message: null,
        items: items,
        hasMore: hasMore
    };
};

export const handler = withAuth(handlerImpl);   
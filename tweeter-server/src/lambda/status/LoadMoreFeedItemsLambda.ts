import { StatusLoadMoreRequest, StatusLoadMoreResponse, User } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: StatusLoadMoreRequest, daoFactory: DynamoDBFactory): Promise<StatusLoadMoreResponse> => {
    const statusService = new StatusService(daoFactory);
    const [items, hasMore] = await statusService.loadMoreFeedItems(request.token, request.userAlias, request.pageSize, request.lastItem);
    return {
        success: true,
        message: null,
        items: items,
        hasMore: hasMore
    };
};

export const handler = withAuth(handlerImpl);
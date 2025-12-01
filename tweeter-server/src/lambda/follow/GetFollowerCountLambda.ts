import { CountResponse, FollowServiceGeneralRequest, User } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: FollowServiceGeneralRequest, daoFactory: DynamoDBFactory): Promise<CountResponse> => {
    const followService = new FollowService(daoFactory);
    const count: number = await followService.getFollowerCount(request.token, User.fromDto(request.user)!);
    return {
        success: true,
        message: null,
        count: count
    };
};

export const handler = withAuth(handlerImpl);
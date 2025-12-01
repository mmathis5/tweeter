import { FollowerStatusRequest, FollowerStatusResponse, User } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: FollowerStatusRequest, daoFactory: DynamoDBFactory): Promise<FollowerStatusResponse> => {
    const followService = new FollowService(daoFactory);
    const isFollower: boolean = await followService.getIsFollowerStatus(request.token, User.fromDto(request.user)!, User.fromDto(request.selectedUser)!);
    return {
        success: true,
        message: null,
        isFollower: isFollower
    };
};

export const handler = withAuth(handlerImpl);
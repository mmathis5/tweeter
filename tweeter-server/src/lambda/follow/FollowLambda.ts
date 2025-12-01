import { FollowAndUnfollowResponse, FollowServiceGeneralRequest, User } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";
import { FollowUnfollowRequest } from "tweeter-shared/dist/model/net/request/FollowUnfollowRequest";

const handlerImpl = async (request: FollowUnfollowRequest, daoFactory: DynamoDBFactory): Promise<FollowAndUnfollowResponse> => {
    const followService = new FollowService(daoFactory);
    const [followerCount, followeeCount] = await followService.follow(request.token, User.fromDto(request.user)!, User.fromDto(request.userToFollowOrUnfollow)!);
    return {
        success: true,
        message: null,
        followerCount: followerCount,
        followeeCount: followeeCount
    };
};

export const handler = withAuth(handlerImpl);
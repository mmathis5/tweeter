import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { Status } from "tweeter-shared";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: PostStatusRequest, daoFactory: DynamoDBFactory): Promise<TweeterResponse> => {
    const statusService = new StatusService(daoFactory);
    await statusService.postStatus(request.token, Status.fromDto(request.status)!);
    return {
        success: true,
        message: null
    };
};

export const handler = withAuth(handlerImpl);
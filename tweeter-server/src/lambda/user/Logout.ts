import { LogoutRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: LogoutRequest, daoFactory: DynamoDBFactory): Promise<TweeterResponse> => {
    const userService = new UserService(daoFactory);
    await userService.logout(request.token);
    return {
        success: true,
        message: null
    };
};

export const handler = withAuth(handlerImpl);
import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";
import { withAuth } from "../LambdaHandlerUtils";

const handlerImpl = async (request: GetUserRequest, daoFactory: DynamoDBFactory): Promise<GetUserResponse> => {
    const userService = new UserService(daoFactory);
    const user = await userService.getUser(request.token, request.alias);
    return {
        success: true,
        message: null,
        user: user!.dto ?? null
    };
};

export const handler = withAuth(handlerImpl);
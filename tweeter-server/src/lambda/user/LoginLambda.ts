import { LoginRequest, LoginAndRegsiterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";

export const handler = async (request: LoginRequest): Promise<LoginAndRegsiterResponse> => {
    const daoFactory = new DynamoDBFactory();
    const userService = new UserService(daoFactory);
    const [user, token] = await userService.login("@" + request.alias, request.password);
    return {
        success: true,
        message: null,
        user: user.dto,
        token: token.dto
    };
}
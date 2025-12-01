import { RegisterRequest, LoginAndRegsiterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoDBFactory } from "../../model/dao/DynamoDBFactory";

export const handler = async (request: RegisterRequest): Promise<LoginAndRegsiterResponse> => {
    const daoFactory = new DynamoDBFactory();
    const userService = new UserService(daoFactory);
    const [user, token] = await userService.register(request.firstName, request.lastName, "@" + request.alias, request.password, request.userImageBytes, request.imageFileExtension);
    return {
        success: true,
        message: null,
        user: user.dto,
        token: token.dto
    };
}
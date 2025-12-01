"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const UserService_1 = require("../../model/service/UserService");
const LambdaHandlerUtils_1 = require("../LambdaHandlerUtils");
const handlerImpl = async (request, daoFactory) => {
    const userService = new UserService_1.UserService(daoFactory);
    await userService.logout(request.token);
    return {
        success: true,
        message: null
    };
};
exports.handler = (0, LambdaHandlerUtils_1.withAuth)(handlerImpl);

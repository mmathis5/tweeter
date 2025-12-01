"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const FollowService_1 = require("../../model/service/FollowService");
const LambdaHandlerUtils_1 = require("../LambdaHandlerUtils");
const handlerImpl = async (request, daoFactory) => {
    const followService = new FollowService_1.FollowService(daoFactory);
    const isFollower = await followService.getIsFollowerStatus(request.token, tweeter_shared_1.User.fromDto(request.user), tweeter_shared_1.User.fromDto(request.selectedUser));
    return {
        success: true,
        message: null,
        isFollower: isFollower
    };
};
exports.handler = (0, LambdaHandlerUtils_1.withAuth)(handlerImpl);

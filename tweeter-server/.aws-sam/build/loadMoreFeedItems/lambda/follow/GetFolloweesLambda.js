"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const FollowService_1 = require("../../model/service/FollowService");
const LambdaHandlerUtils_1 = require("../LambdaHandlerUtils");
const handlerImpl = async (request, daoFactory) => {
    const followService = new FollowService_1.FollowService(daoFactory);
    const [items, hasMore] = await followService.loadMoreFollowees(request.token, request.userAlias, request.pageSize, request.lastItem);
    return {
        success: true,
        message: null,
        items: items,
        hasMore: hasMore
    };
};
exports.handler = (0, LambdaHandlerUtils_1.withAuth)(handlerImpl);

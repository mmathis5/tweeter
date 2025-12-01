"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const StatusService_1 = require("../../model/service/StatusService");
const tweeter_shared_1 = require("tweeter-shared");
const LambdaHandlerUtils_1 = require("../LambdaHandlerUtils");
const handlerImpl = async (request, daoFactory) => {
    const statusService = new StatusService_1.StatusService(daoFactory);
    await statusService.postStatus(request.token, tweeter_shared_1.Status.fromDto(request.status));
    return {
        success: true,
        message: null
    };
};
exports.handler = (0, LambdaHandlerUtils_1.withAuth)(handlerImpl);

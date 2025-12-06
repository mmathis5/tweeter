"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const Service_1 = require("./Service");
class AuthService extends Service_1.Service {
    constructor(daoFactory) {
        super(daoFactory);
    }
    async isAuthenticated(token) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            const tokenData = await daoFactory.getAuthTokenDAO().getTokenData(token);
            if (tokenData === null) {
                return false;
            }
            // Check if token is older than 30 minutes (30 * 60 * 1000 milliseconds)
            const TOKEN_EXPIRATION_TIME_MS = 30 * 60 * 1000; // 30 minutes
            const currentTime = Date.now();
            const tokenAge = currentTime - tokenData.timestamp;
            //if token is older than 30 minutes, delete token
            if (tokenAge > TOKEN_EXPIRATION_TIME_MS) {
                await daoFactory.getAuthTokenDAO().deleteToken(token);
                return false;
            }
            return true;
        });
    }
}
exports.AuthService = AuthService;

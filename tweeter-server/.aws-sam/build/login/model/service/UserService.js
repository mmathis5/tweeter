"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const Service_1 = require("./Service");
class UserService extends Service_1.Service {
    constructor(daoFactory) {
        super(daoFactory);
    }
    async getUser(token, alias) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getUserDAO().getUser(alias);
        });
    }
    async login(alias, password) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            // Authenticate user
            const user = await daoFactory.getUserDAO().login(alias, password);
            if (user === null) {
                throw new Error("unauthorized or invalid alias or password");
            }
            // Generate and store token
            const token = tweeter_shared_1.AuthToken.Generate();
            await daoFactory.getAuthTokenDAO().putToken(token, user.alias);
            return [user, token];
        });
    }
    async logout(token) {
        await this.doWithDAOFactory(async (daoFactory) => {
            await daoFactory.getAuthTokenDAO().deleteToken(token);
        });
    }
    async register(firstName, lastName, alias, password, userImageBytes, imageFileExtension) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            // Check if user already exists
            const existingUser = await daoFactory.getUserDAO().getUser(alias);
            if (existingUser !== null) {
                throw new Error("[Bad Request] User with this alias already exists");
            }
            // Upload image to S3
            const fileName = `${alias}.${imageFileExtension}`;
            const imageUrl = await daoFactory.getS3DAO().putImage(fileName, Buffer.from(userImageBytes).toString("base64"));
            // Register user
            const user = await daoFactory.getUserDAO().register(firstName, lastName, alias, password, imageUrl);
            // Generate and store token
            const token = tweeter_shared_1.AuthToken.Generate();
            await daoFactory.getAuthTokenDAO().putToken(token, user.alias);
            return [user, token];
        });
    }
}
exports.UserService = UserService;

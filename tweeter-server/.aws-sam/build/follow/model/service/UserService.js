"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const Service_1 = require("./Service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
            // Get user with password hash from DAO
            const userData = await daoFactory.getUserDAO().getUserWithPasswordHash(alias);
            if (userData === null) {
                throw new Error("unauthorized or invalid alias");
            }
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(password, userData.passwordHash);
            if (!isPasswordValid) {
                throw new Error("unauthorized or invalid password");
            }
            // Generate and store token
            const token = tweeter_shared_1.AuthToken.Generate();
            await daoFactory.getAuthTokenDAO().putToken(token, userData.user.alias);
            return [userData.user, token];
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
            // Hash password in service layer
            const saltRounds = 10;
            const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
            // Register user (password already hashed)
            const user = await daoFactory.getUserDAO().putUserWithPasswordHash(firstName, lastName, alias, passwordHash, imageUrl);
            // Generate and store token
            const token = tweeter_shared_1.AuthToken.Generate();
            await daoFactory.getAuthTokenDAO().putToken(token, user.alias);
            return [user, token];
        });
    }
}
exports.UserService = UserService;

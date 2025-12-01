"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
const Service_1 = require("./Service");
class FollowService extends Service_1.Service {
    constructor(daoFactory) {
        super(daoFactory);
    }
    async loadMoreFollowees(token, userAlias, pageSize, lastItem) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getFollowDAO().getFollowees(userAlias, pageSize, lastItem?.alias ?? null);
        });
    }
    ;
    async loadMoreFollowers(token, userAlias, pageSize, lastItem) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getFollowDAO().getFollowers(userAlias, pageSize, lastItem?.alias ?? null);
        });
    }
    ;
    async getIsFollowerStatus(token, user, selectedUser) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getFollowDAO().isFollower(user.alias, selectedUser.alias);
        });
    }
    ;
    async getFolloweeCount(token, user) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getFollowDAO().getFolloweeCount(user.alias) ?? 0;
        });
    }
    ;
    async getFollowerCount(token, user) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getFollowDAO().getFollowerCount(user.alias) ?? 0;
        });
    }
    ;
    async follow(token, currentUser, userToFollow) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            await daoFactory.getFollowDAO().follow(currentUser.alias, userToFollow.alias);
            // Get the updated counts for the user being followed
            const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToFollow.alias) ?? 0;
            const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToFollow.alias) ?? 0;
            return [followerCount, followeeCount];
        });
    }
    ;
    async unfollow(token, currentUser, userToUnfollow) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            await daoFactory.getFollowDAO().unfollow(currentUser.alias, userToUnfollow.alias);
            // Get the updated counts for the user being followed
            const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToUnfollow.alias) ?? 0;
            const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToUnfollow.alias) ?? 0;
            return [followerCount, followeeCount];
        });
    }
    ;
}
exports.FollowService = FollowService;

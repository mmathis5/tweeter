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
            // Get followee aliases from FollowDAO
            const [followeeAliases, hasMore] = await daoFactory.getFollowDAO().getFolloweeAliases(userAlias, pageSize, lastItem?.alias ?? null);
            // Fetch user data for each followee alias (service layer responsibility)
            const followees = [];
            for (const alias of followeeAliases) {
                const user = await daoFactory.getUserDAO().getUser(alias);
                if (user) {
                    followees.push(user.dto);
                }
            }
            return [followees, hasMore];
        });
    }
    ;
    async loadMoreFollowers(token, userAlias, pageSize, lastItem) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            // Get follower aliases from FollowDAO
            const [followerAliases, hasMore] = await daoFactory.getFollowDAO().getFollowerAliases(userAlias, pageSize, lastItem?.alias ?? null);
            // Fetch user data for each follower alias (service layer responsibility)
            const followers = [];
            for (const alias of followerAliases) {
                const user = await daoFactory.getUserDAO().getUser(alias);
                if (user) {
                    followers.push(user.dto);
                }
            }
            return [followers, hasMore];
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
            // Create follow relationship (FollowDAO only works with Follows table)
            await daoFactory.getFollowDAO().follow(currentUser.alias, userToFollow.alias);
            // Update counts in Users table (service layer responsibility)
            await daoFactory.getUserDAO().incrementFollowerCount(userToFollow.alias);
            await daoFactory.getUserDAO().incrementFolloweeCount(currentUser.alias);
            // Get the updated counts for the user being followed
            const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToFollow.alias) ?? 0;
            const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToFollow.alias) ?? 0;
            return [followerCount, followeeCount];
        });
    }
    ;
    async unfollow(token, currentUser, userToUnfollow) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            // Remove follow relationship (FollowDAO only works with Follows table)
            await daoFactory.getFollowDAO().unfollow(currentUser.alias, userToUnfollow.alias);
            // Update counts in Users table (service layer responsibility)
            await daoFactory.getUserDAO().decrementFollowerCount(userToUnfollow.alias);
            await daoFactory.getUserDAO().decrementFolloweeCount(currentUser.alias);
            // Get the updated counts for the user being unfollowed
            const followerCount = await daoFactory.getFollowDAO().getFollowerCount(userToUnfollow.alias) ?? 0;
            const followeeCount = await daoFactory.getFollowDAO().getFolloweeCount(userToUnfollow.alias) ?? 0;
            return [followerCount, followeeCount];
        });
    }
    ;
}
exports.FollowService = FollowService;

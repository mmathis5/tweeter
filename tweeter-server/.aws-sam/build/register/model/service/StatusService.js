"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusService = void 0;
const tweeter_shared_1 = require("tweeter-shared");
const Service_1 = require("./Service");
class StatusService extends Service_1.Service {
    constructor(daoFactory) {
        super(daoFactory);
    }
    async loadMoreFeedItems(token, userAlias, pageSize, lastItem) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getStatusDAO().getFeed(userAlias, pageSize, lastItem?.timestamp ?? null);
        });
    }
    ;
    async loadMoreStoryItems(token, userAlias, pageSize, lastItem) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            return await daoFactory.getStatusDAO().getStory(userAlias, pageSize, lastItem?.timestamp ?? null);
        });
    }
    ;
    async postStatus(token, newStatus) {
        return await this.doWithDAOFactory(async (daoFactory) => {
            const user = await daoFactory.getUserDAO().getUser(newStatus.user.alias);
            if (!user) {
                throw new Error("Bad Request: User not found");
            }
            const statusWithOriginalUrl = new tweeter_shared_1.Status(newStatus.post, user, newStatus.timestamp);
            // Post status to Stories table (DAO handles only data access)
            await daoFactory.getStatusDAO().postStatus(statusWithOriginalUrl);
            // Business logic: Get all followers and add status to their feeds
            const followerAliases = await this.getAllFollowerAliases(daoFactory, user.alias);
            // Add status to each follower's feed
            const feedPromises = followerAliases.map(followerAlias => daoFactory.getStatusDAO().addStatusToFeed(followerAlias, statusWithOriginalUrl));
            await Promise.all(feedPromises);
        });
    }
    ;
    async getAllFollowerAliases(daoFactory, followeeAlias) {
        // Get all followers by paginating through results
        const followerAliases = [];
        let lastFollowerAlias = null;
        const pageSize = 100;
        do {
            const [followers, hasMore] = await daoFactory.getFollowDAO().getFollowerAliases(followeeAlias, pageSize, lastFollowerAlias);
            followerAliases.push(...followers);
            lastFollowerAlias = hasMore && followers.length > 0 ? followers[followers.length - 1] : null;
        } while (lastFollowerAlias !== null);
        return followerAliases;
    }
    async getFakeData(lastItem, pageSize) {
        const [items, hasMore] = tweeter_shared_1.FakeData.instance.getPageOfStatuses(tweeter_shared_1.Status.fromDto(lastItem), pageSize);
        const dtos = items.map((status) => status.dto);
        return [dtos, hasMore];
    }
}
exports.StatusService = StatusService;

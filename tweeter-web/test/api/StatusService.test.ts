import { StatusService } from "../../src/model.service/StatusService";
import { AuthToken, Status } from "tweeter-shared";
import "isomorphic-fetch";

describe("StatusService Integration Tests", () => {
  let statusService: StatusService;

  beforeEach(() => {
    statusService = new StatusService();
  });

  describe("loadMoreStoryItems", () => {
    it("should successfully retrieve story items for a user", async () => {
      const authToken = new AuthToken("123", Date.now());
      const userAlias = "@allen";
      const pageSize = 10;
      const lastItem: Status | null = null;

      const [storyItems, hasMore] = await statusService.loadMoreStoryItems(
        authToken,
        userAlias,
        pageSize,
        lastItem
      );

      expect(storyItems).toBeInstanceOf(Array);
      expect(storyItems.length).toBeGreaterThan(0);
      expect(storyItems.length).toBeLessThanOrEqual(pageSize);

      // Verify each item is a Status instance
      storyItems.forEach((item) => {
        expect(item).toBeInstanceOf(Status);
        expect(item.post).toBeTruthy();
        expect(typeof item.post).toBe("string");
        expect(item.user).toBeTruthy();
        expect(typeof item.timestamp).toBe("number");
        expect(item.timestamp).not.toBeNaN();
      });

      // Verify hasMore is a boolean
      expect(typeof hasMore).toBe("boolean");
    }, 10000);
  });
});


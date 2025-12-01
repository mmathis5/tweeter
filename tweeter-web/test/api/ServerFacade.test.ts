import { ServerFacade } from "../../src/network/ServerFacade";
import { RegisterRequest, User, AuthToken, PagedUserItemRequest, FollowServiceGeneralRequest } from "tweeter-shared";
import { Buffer } from "buffer";
import "isomorphic-fetch"

describe("ServerFacade Integration Tests", () => {
  let serverFacade: ServerFacade;

  beforeEach(() => {
    serverFacade = new ServerFacade();
  });

  describe("register", () => {
    it("should successfully register a new user and return User and AuthToken", async () => {
      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      // Convert to array so it serializes correctly as JSON array instead of object
      const userImageBytes = Array.from(Buffer.from(testImageBase64, "base64"));
      const request: RegisterRequest = {
        firstName: "Allen",
        lastName: "Anderson",
        alias: `@allen`,
        password: "testPassword123",
        userImageBytes: userImageBytes as any, // Type assertion needed since RegisterRequest expects Uint8Array
        imageFileExtension: "png"
      };

      const [user, authToken] = await serverFacade.register(request);
      
      // Verify User object
      expect(user).toBeInstanceOf(User);
      expect(user.firstName).toBe("Allen");
      expect(user.lastName).toBe("Anderson");
      expect(user.alias).toBe(`@allen`);
      expect(user.imageUrl).toBeTruthy();
      expect(typeof user.imageUrl).toBe("string");

      // Verify AuthToken object
      expect(authToken).toBeInstanceOf(AuthToken);
      expect(authToken.token).toBeTruthy();
      expect(authToken.token.length).toBeGreaterThan(0);
    }, 10000);
  });
  describe("getFollowers", () => {
    it("should successfully get 5 followers for a user", async () => {
      const request: PagedUserItemRequest = {
        token: "123",
        userAlias: "@allen",
        pageSize: 5,
        lastItem: null
      };
      const [followers, hasMore] = await serverFacade.getMoreFollowers(request);
      expect(followers).toBeInstanceOf(Array);
      expect(followers.length).toBe(5);
      expect(hasMore).toBe(true);
    });
  });

  describe("Get follower count", () => {
    it("should successfully get follower count for a user", async () => {
      const request: FollowServiceGeneralRequest = {
        token: "123",
        user: {
          alias: "@allen",
          firstName: "Allen",
          lastName: "Anderson",
          imageUrl: "https://example.com/image.png"
        }
      };
      const count: number = await serverFacade.getFollowerCount(request);
      expect(typeof count).toBe("number");
    });
  });
  
  
});


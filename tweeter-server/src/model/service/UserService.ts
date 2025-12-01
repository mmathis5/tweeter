import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/DAOFactory";

export class UserService extends Service {
  constructor(daoFactory: DAOFactory) {
    super(daoFactory);
  }

  public async getUser(
    token: string,
    alias: string
  ): Promise<User | null> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      return await daoFactory.getUserDAO().getUser(alias);
    });
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
      // Authenticate user
      const user = await daoFactory.getUserDAO().login(alias, password);
      
      if (user === null) {
        throw new Error("unauthorized or invalid alias or password");
      }

      // Generate and store token
      const token = AuthToken.Generate();
      await daoFactory.getAuthTokenDAO().putToken(token, user.alias);

      return [user, token];
    });
  }

  public async logout(token: string): Promise<void> {
    await this.doWithDAOFactory(async (daoFactory) => {
      await daoFactory.getAuthTokenDAO().deleteToken(token);
    });
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    return await this.doWithDAOFactory(async (daoFactory) => {
        // Check if user already exists
        const existingUser = await daoFactory.getUserDAO().getUser(alias);
        if (existingUser !== null) {
            throw new Error("[Bad Request] User with this alias already exists");
        }

      // Upload image to S3
      const fileName = `${alias}.${imageFileExtension}`;
      const imageUrl = await daoFactory.getS3DAO().putImage(
        fileName,
        Buffer.from(userImageBytes).toString("base64")
      );

      // Register user
      const user = await daoFactory.getUserDAO().register(
        firstName,
        lastName,
        alias,
        password,
        imageUrl
      );

      // Generate and store token
      const token = AuthToken.Generate();
      await daoFactory.getAuthTokenDAO().putToken(token, user.alias);

      return [user, token];
    });
  }

}
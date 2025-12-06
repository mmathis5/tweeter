import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { DAOFactory } from "../dao/DAOFactory";
import bcrypt from "bcryptjs";

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
      // Get user with password hash from DAO
      const userData = await daoFactory.getUserDAO().getUserWithPasswordHash(alias);
      
      if (userData === null) {
        throw new Error("unauthorized or invalid alias");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
      if (!isPasswordValid) {
        throw new Error("unauthorized or invalid password");
      }

      // Generate and store token
      const token = AuthToken.Generate();
      await daoFactory.getAuthTokenDAO().putToken(token, userData.user.alias);

      return [userData.user, token];
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

      // Hash password in service layer
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Register user (password already hashed)
      const user = await daoFactory.getUserDAO().putUserWithPasswordHash(
        firstName,
        lastName,
        alias,
        passwordHash,
        imageUrl
      );

      // Generate and store token
      const token = AuthToken.Generate();
      await daoFactory.getAuthTokenDAO().putToken(token, user.alias);

      return [user, token];
    });
  }

}
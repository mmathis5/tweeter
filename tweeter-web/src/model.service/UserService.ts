import { Buffer } from "buffer";
import { AuthToken, FakeData, GetUserRequest, LoginRequest, LogoutRequest, RegisterRequest, User } from "tweeter-shared";
import { Service } from "./Service";


export class UserService extends Service {

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    const request: GetUserRequest = {
      token: authToken.token,
      alias: alias
    };
    return this.serverFacade.getUser(request);
  };

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const request: LoginRequest = {
      alias: alias,
      password: password
    };
    return this.serverFacade.login(request);
  };


  public async logout(authToken: AuthToken): Promise<void> {
    const request: LogoutRequest = {
      token: authToken.token
    };
    return this.serverFacade.logout(request);
  };


  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const request: RegisterRequest = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      password: password,
      userImageBytes: userImageBytes,
      imageFileExtension: imageFileExtension
    };
    return this.serverFacade.register(request);
  };




}
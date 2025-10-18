import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";
import { AuthenticationPresenter, AuthenticationView } from "./AuthenticationPresenter";

export class LoginPresenter extends AuthenticationPresenter<AuthenticationView> {
    public constructor(view: AuthenticationView) {
        super(view);
    }

    public async doLogin (alias: string, password: string, rememberMe: boolean, originalUrl: string) {
        this.doAuthentication(() => this.userService.login(alias, password), rememberMe, originalUrl);
      };

      protected operationType(): string{
        return "log user in";
      }
    

}
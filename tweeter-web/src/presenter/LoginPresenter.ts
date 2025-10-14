import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface LoginView {
    
  setIsLoading: (isLoading: boolean) => void;
  updateUserInfo: (user: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
  displayErrorMessage: (message: string) => void;
  navigate: (path: string) => void;
}


export class LoginPresenter {
    private userService: UserService;
    private _view: LoginView;

    public constructor(view: LoginView) {
        this.userService = new UserService();
        this._view = view;
    }

    public async doLogin (alias: string, password: string, rememberMe: boolean, originalUrl: string) {
        try {
          this._view.setIsLoading(true);
    
          const [user, authToken] = await this.userService.login(alias, password);
    
          this._view.updateUserInfo(user, user, authToken, rememberMe);
    
          if (!!originalUrl) {
            this._view.navigate(originalUrl);
          } else {
            this._view.navigate(`/feed/${user.alias}`);
          }
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to log user in because of exception: ${error}`,
          );
        } finally {
          this._view.setIsLoading(false);
        }
      };
    

}
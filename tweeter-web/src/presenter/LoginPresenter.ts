import { AuthToken, User } from "tweeter-shared";
import { AuthenticationService } from "../model.service/AuthenticationService";

export interface LoginView {
    updateUserInfo: (user: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
    
    setIsLoading: (isLoading: boolean) => void;
}


export class LoginPresenter {
    // private _view: LoginView;
    // private loginService: AuthenticationService;

    // protected constructor(view: LoginView) {
    //     this._view = view;
    //     this.loginService = new AuthenticationService();
    // }

    // public async doLogin(alias: string, password: string, rememberMe: boolean, originalUrl: string)  {
    //     try {
    //       this._view.setIsLoading(true);
    
    //       const [user, authToken] = await this.loginService.login(alias, password);
    
    //       this._view.updateUserInfo(user, user, authToken, rememberMe);
    
    //       if (!!props.originalUrl) {
    //         navigate(props.originalUrl);
    //       } else {
    //         navigate(`/feed/${user.alias}`);
    //       }
    //     } catch (error) {
    //       displayErrorMessage(
    //         `Failed to log user in because of exception: ${error}`,
    //       );
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };
}
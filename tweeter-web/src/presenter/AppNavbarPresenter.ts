import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface AppNavbarView {
    displayErrorMessage: (message: string) => void;
    displayInfoMessage: (message: string, timeout: number) => string;
    deleteMessage: (message: string) => void;
    clearUserInfo: () => void;
    navigate: (path: string) => void;
}

export class AppNavbarPresenter {
    private _view: AppNavbarView;
    private userService: UserService;

    public constructor (view: AppNavbarView) {
        this._view = view;
        this.userService = new UserService();
    }

    public async logOut (authToken: AuthToken){
        const loggingOutToastId = this._view.displayInfoMessage("Logging Out...", 0);
    
        try {
          await this.userService.logout(authToken!);
    
          this._view.deleteMessage(loggingOutToastId);
          this._view.clearUserInfo();
          this._view.navigate("/login");
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to log user out because of exception: ${error}`
          );
        }
      };
}
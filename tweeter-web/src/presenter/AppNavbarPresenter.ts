import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { MessageView, Presenter } from "./Presenter";

export interface AppNavbarView extends MessageView {
    displayInfoMessage: (message: string, timeout: number) => string;
    deleteMessage: (message: string) => void;
    clearUserInfo: () => void;
    navigate: (path: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
    private _userService: UserService;

    public constructor (view: AppNavbarView) {
        super(view);
        this._userService = new UserService();
    }

    public get userService(): UserService {
        return this._userService;
    }

    public async logOut (authToken: AuthToken){
      const loggingOutToastId = this._view.displayInfoMessage("Logging Out...", 0);

      await this.doFailureReportingOperation(async() => {
        await this.userService.logout(authToken!);
    
        this._view.deleteMessage(loggingOutToastId);
        this._view.clearUserInfo();
        this._view.navigate("/login");
        }, "log user out");
      };
}
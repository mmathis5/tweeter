import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserNavigationHookView {
    displayErrorMessage: (message: string) => void;
    setDisplayedUser: (user: User) => void;
}

export class UserNavigationHookPresenter {
    private _view: UserNavigationHookView;
    private userService: UserService;

    public constructor(view: UserNavigationHookView) {
        this._view = view;
        this.userService = new UserService();
    }

    public async getUser (
        authToken: AuthToken,
        alias: string
      ): Promise<User | null> {
        return this.userService.getUser(authToken, alias);
    };

    public async navigateToUser (
      event: React.MouseEvent, 
      authToken: AuthToken, 
      displayedUser: User, 
      navigate: (path: string) => void, 
      featurePath: string): Promise<void> {
        event.preventDefault();
    
        try {
          const alias = this.extractAlias(event.target.toString());
    
          const toUser = await this.getUser(authToken!, alias);
    
          if (toUser) {
            if (!toUser.equals(displayedUser!)) {
              this._view.setDisplayedUser(toUser);
              navigate(`${featurePath}/${toUser.alias}`);
            }
          }
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to get user because of exception: ${error}`,
          );
        }
      };
    

      private extractAlias (value: string): string {
        const index = value.indexOf("@");
        return value.substring(index);
      };
    
}
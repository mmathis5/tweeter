import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface UserNavigationHookView extends View{
    setDisplayedUser: (user: User) => void;
}

export class UserNavigationHookPresenter extends Presenter<UserNavigationHookView> {
    private userService: UserService;

    public constructor(view: UserNavigationHookView) {
        super(view);
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
    

        await this.doFailureReportingOperation(async() => {
          const alias = this.extractAlias(event.target.toString());
    
          const toUser = await this.getUser(authToken!, alias);
    
          if (toUser) {
            if (!toUser.equals(displayedUser!)) {
              this._view.setDisplayedUser(toUser);
              navigate(`${featurePath}/${toUser.alias}`);
            }
          }
        }, "get user");
      };
    

      private extractAlias (value: string): string {
        const index = value.indexOf("@");
        return value.substring(index);
      };
    
}
import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";

export interface AuthenticationView extends View {
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (user: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
    navigate: (path: string) => void;
}

export abstract class AuthenticationPresenter<V extends AuthenticationView> extends Presenter<V> {
    protected _userService: UserService;

    public constructor(view: V) {
        super(view);
        this._userService = new UserService();
    }

    protected get userService(): UserService {
        return this._userService;
    }

    public async doAuthentication(
        authOperation: () => Promise<[User, AuthToken]>,
        rememberMe: boolean,
        originalUrl: string) {
        await this.doFailureReportingOperation(async () => {
            this._view.setIsLoading(true);

            const [user, authToken] = await authOperation();

            this._view.updateUserInfo(user, user, authToken, rememberMe);

            this.doNavigation(user, originalUrl);

        }, this.operationType());

        //This deviates a bit from what wilkerson showed but it's not encapsulated in the doFailureReportingOperation
        //so I think it's okay to do it here.
        this._view.setIsLoading(false);
    };

    public async doNavigation(user: User, originalUrl: string) {
        if (!!originalUrl) {
            this._view.navigate(originalUrl);
        } else {
            this._view.navigate(`/feed/${user.alias}`);
        }
    }

    protected abstract operationType(): string;


}
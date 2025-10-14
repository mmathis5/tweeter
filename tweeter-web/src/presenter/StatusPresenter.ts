import { AuthToken, Status, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface StatusView{
    addItems: (newItems: Status[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class StatusPresenter {
    private _view: StatusView;
    private _hasMoreItems: boolean = true;
    private _lastItem: Status | null = null;
    private userService: UserService;

    protected constructor(view: StatusView) {
        this._view = view;
        this.userService = new UserService();
    }

    protected get view(): StatusView{
        return this._view;
    }

    public get hasMoreItems(): boolean{
        return this._hasMoreItems;
    }

    protected set hasMoreItems(value: boolean){
        this._hasMoreItems = value;
    }

    protected get lastItem(): Status | null{
        return this._lastItem;
    }

    protected set lastItem(value: Status | null){
        this._lastItem = value;
    }

    public async reset() {
        this._hasMoreItems = true;
        this._lastItem = null;
    };

    public async getUser (
        authToken: AuthToken,
        alias: string
      ): Promise<User | null> {
        // TODO: Replace with the result of calling server
        return this.userService.getUser(authToken, alias);
    };

    public abstract loadMoreItems (authToken: AuthToken, userAlias: string): void
}
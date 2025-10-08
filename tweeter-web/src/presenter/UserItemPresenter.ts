import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserItemView{
    addItems: (items: User[]) => void;
    displayErrorMessage: (message: string) => void;
}
export abstract class UserItemPresenter {
    private _view: UserItemView;
    private userService: UserService;
    private _hasMoreItems: boolean = true;
    private _lastItem: User | null = null;


    protected constructor(view: UserItemView) {
        this._view = view;
        this.userService = new UserService();
    }

    //setting a getter function allows us to access the private variable _view from the other classes. 
    protected get view(){
        return this._view;
    }

    protected get lastItem(){
        return this._lastItem;
    }

    protected set lastItem(value: User | null){
        this._lastItem = value;
    }

    //has to be public because it's accessed by the UserItemScroller component
    public get hasMoreItems(){
        return this._hasMoreItems;
    }

    protected set hasMoreItems(value: boolean){
        this._hasMoreItems = value;
    }

    reset() {
        this._lastItem = null;
        this.hasMoreItems = true;
    }



    public async getUser (
        authToken: AuthToken,
        alias: string
      ): Promise<User | null> {
        return this.userService.getUser(authToken, alias);
      };


    public abstract loadMoreItems (authToken: AuthToken, userAlias: string): void


}
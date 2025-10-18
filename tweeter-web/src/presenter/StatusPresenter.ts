import { AuthToken, Status, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";
import { PagedItemPresenter, PagedItemView } from "./PagedItemPresenter";
import { StatusService } from "../model.service/StatusService";


export abstract class StatusPresenter extends PagedItemPresenter<Status, StatusService> {
    protected serviceFactory(): StatusService {
        return new StatusService();
    }    
} 
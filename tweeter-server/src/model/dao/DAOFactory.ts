import { IStatusDAO } from "./IStatusDAO";
import { IFollowDAO } from "./IFollowDAO";
import { IAuthTokenDAO } from "./IAuthTokenDAO";
import { IS3DAO } from "./IS3DAO";
import { IUserDAO } from "./IUserDAO";

export interface DAOFactory {
    getUserDAO(): IUserDAO;
    getStatusDAO(): IStatusDAO;
    getFollowDAO(): IFollowDAO;
    getAuthTokenDAO(): IAuthTokenDAO;
    getS3DAO(): IS3DAO;
  }

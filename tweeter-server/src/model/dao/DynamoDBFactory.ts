import { IStatusDAO } from "./IStatusDAO";
import { IFollowDAO } from "./IFollowDAO";
import { IAuthTokenDAO } from "./IAuthTokenDAO";
import { IS3DAO } from "./IS3DAO";
import { IUserDAO } from "./IUserDAO";
import { DAOFactory } from "./DAOFactory";
import { DynamoDBUserDAO } from "./dynamoDB/DynamoDBUserDAO";
import { DynamoDBAuthTokenDAO } from "./dynamoDB/DynamoDBAuthTokenDAO";
import { DynamoDBS3DAO } from "./dynamoDB/DynamoDBS3DAO";
import { DynamoDBStatusDAO } from "./dynamoDB/DynamoDBStatusDAO";
import { DynamoDBFollowDAO } from "./dynamoDB/DynamoDBFollowDAO";

export class DynamoDBFactory implements DAOFactory {
    getUserDAO(): IUserDAO {
        return new DynamoDBUserDAO();
    }
    
    getStatusDAO(): IStatusDAO {
        return new DynamoDBStatusDAO();
    }
    
    getFollowDAO(): IFollowDAO {
        return new DynamoDBFollowDAO();
    }
    
    getAuthTokenDAO(): IAuthTokenDAO {
        return new DynamoDBAuthTokenDAO();
    }
    
    getS3DAO(): IS3DAO {
        return new DynamoDBS3DAO();
    }
}
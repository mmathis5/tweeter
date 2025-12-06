import { DAOFactory } from "../dao/DAOFactory";
import { Service } from "./Service";

export class AuthService extends Service {
    constructor(daoFactory: DAOFactory) {
        super(daoFactory);
    }

    public async isAuthenticated(token: string): Promise<boolean> {
        return await this.doWithDAOFactory(async (daoFactory) => {
            const tokenData = await daoFactory.getAuthTokenDAO().getTokenData(token);
            
            if (tokenData === null) {
                return false;
            }

            // Check if token is older than 30 minutes (30 * 60 * 1000 milliseconds)
            const TOKEN_EXPIRATION_TIME_MS = 30 * 60 * 1000; // 30 minutes
            const currentTime = Date.now();
            const tokenAge = currentTime - tokenData.timestamp;

            //if token is older than 30 minutes, delete token
            if (tokenAge > TOKEN_EXPIRATION_TIME_MS) {
                await daoFactory.getAuthTokenDAO().deleteToken(token);
                return false;
            }

            return true;
        });
    }
}
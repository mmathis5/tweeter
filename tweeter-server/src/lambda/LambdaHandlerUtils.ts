import { DynamoDBFactory } from "../model/dao/DynamoDBFactory";
import { AuthService } from "../model/service/AuthService";

interface AuthenticatedRequest {
    token: string;
}

export function withAuth<TRequest extends AuthenticatedRequest, TResponse>(
    handler: (request: TRequest, daoFactory: DynamoDBFactory) => Promise<TResponse>
): (request: TRequest) => Promise<TResponse> {
    return async (request: TRequest): Promise<TResponse> => {
        const daoFactory = new DynamoDBFactory();
        const authService = new AuthService(daoFactory);
        const isAuthenticated = await authService.isAuthenticated(request.token);
        if (!isAuthenticated) {
            throw new Error("unauthorized or invalid or expired authentication token");
        }
        
        return await handler(request, daoFactory);
    };
}


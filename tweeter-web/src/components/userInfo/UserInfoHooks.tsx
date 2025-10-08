import { useContext } from "react";
import { UserInfoContext, UserInfoActionsContext } from "./UserInfoContexts";

export const useUserInfoActions = () => {
    return useContext(UserInfoActionsContext);
}

export const useUserInfo = () => {
    return useContext(UserInfoContext);
}
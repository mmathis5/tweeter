import { useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { UserNavigationHookPresenter, UserNavigationHookView } from "../../presenter/UserNavigationHookPresenter";
import { useRef } from "react";

export const useUserNavigationHook = (featurePath: string) => {

  const {displayErrorMessage} = useMessageActions();
  const {displayedUser, authToken} = useUserInfo();
  const {setDisplayedUser} = useUserInfoActions();
  const navigate = useNavigate();

  const listener: UserNavigationHookView = {
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser
  }

  const presenterRef = useRef<UserNavigationHookPresenter | null>(null)
  if(!presenterRef.current){
    presenterRef.current = new UserNavigationHookPresenter(listener);
  }

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    presenterRef.current!.navigateToUser(event, authToken!, displayedUser!, navigate, featurePath);
  };

  return navigateToUser;
};
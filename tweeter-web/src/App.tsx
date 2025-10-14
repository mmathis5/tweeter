import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import UserItemScroller from "./components/mainLayout/UserItemScroller";
import StatusItemScroller from "./components/mainLayout/StatusItemScroller";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import { UserItemView } from "./presenter/UserItemPresenter";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { StatusView } from "./presenter/StatusPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { LoginPresenter, LoginView } from "./presenter/LoginPresenter";
import { RegisterPresenter, RegisterView } from "./presenter/RegisterPresenter";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route path="feed/:displayedUser" element={<StatusItemScroller key={`feed-${displayedUser!.alias}`}  featureUrl="/feed" presenterFactory={(view: StatusView) => new FeedPresenter(view)} />} />
        <Route path="story/:displayedUser" element={<StatusItemScroller key={`story-${displayedUser!.alias}`} featureUrl="/story" presenterFactory={(view: StatusView) => new StoryPresenter(view)} />} />
        <Route path="followees/:displayedUser" element={<UserItemScroller key={`followees-${displayedUser!.alias}`} featureUrl="/followees" presenterFactory={(view: UserItemView) => new FolloweePresenter(view)} />} />
        <Route path="followers/:displayedUser" element={<UserItemScroller key={`followers-${displayedUser!.alias}`} featureUrl="/followers" presenterFactory={(view: UserItemView) => new FollowerPresenter(view)} />} />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
      </Route> 
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login presenterFactory={(view: LoginView) => new LoginPresenter(view)} />} />
      <Route path="/register" element={<Register presenterFactory={(view: RegisterView) => new RegisterPresenter(view)} />} />
      <Route path="*" element={<Login originalUrl={location.pathname} presenterFactory={(view: LoginView) => new LoginPresenter(view)} />} />
    </Routes>
  );
};

export default App;

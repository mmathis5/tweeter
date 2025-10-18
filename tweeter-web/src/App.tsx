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
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { LoginPresenter } from "./presenter/LoginPresenter";
import { RegisterPresenter, RegisterView } from "./presenter/RegisterPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import { AuthenticationView } from "./presenter/AuthenticationPresenter";
import StatusItem from "./components/statusItem/StatusItem";
import UserItem from "./components/userItem/UserItem";
import ItemScroller from "./components/mainLayout/ItemScroller";
import { StatusPresenter } from "./presenter/StatusPresenter";
import { UserItemPresenter } from "./presenter/UserItemPresenter";

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
  const StatusComponentFactory = (item: Status, featureUrl: string) => {
    return <StatusItem status={item} featurePath={featureUrl} />;
  };
  const UserComponentFactory = (item: User, featureUrl: string) => {
    return <UserItem user={item} featurePath={featureUrl} />;
  };

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route path="feed/:displayedUser" element={<ItemScroller<Status, StatusPresenter> key={`feed-${displayedUser!.alias}`}  featureUrl="/feed" presenterFactory={(view: PagedItemView<Status>) => new FeedPresenter(view)} itemComponentFactory={StatusComponentFactory} />} />
        <Route path="story/:displayedUser" element={<ItemScroller<Status, StatusPresenter> key={`story-${displayedUser!.alias}`} featureUrl="/story" presenterFactory={(view: PagedItemView<Status>) => new StoryPresenter(view)} itemComponentFactory={StatusComponentFactory} />} />
        <Route path="followees/:displayedUser" element={<ItemScroller<User, UserItemPresenter> key={`followees-${displayedUser!.alias}`} featureUrl="/followees" presenterFactory={(view: PagedItemView<User>) => new FolloweePresenter(view)} itemComponentFactory={UserComponentFactory} />} />
        <Route path="followers/:displayedUser" element={<ItemScroller<User, UserItemPresenter> key={`followers-${displayedUser!.alias}`} featureUrl="/followers" presenterFactory={(view: PagedItemView<User>) => new FollowerPresenter(view)} itemComponentFactory={UserComponentFactory} />} />
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
      <Route path="/login" element={<Login presenterFactory={(view: AuthenticationView) => new LoginPresenter(view)} />} />
      <Route path="/register" element={<Register presenterFactory={(view: RegisterView) => new RegisterPresenter(view)} />} />
      <Route path="*" element={<Login originalUrl={location.pathname} presenterFactory={(view: AuthenticationView) => new LoginPresenter(view)} />} />
    </Routes>
  );
};

export default App;

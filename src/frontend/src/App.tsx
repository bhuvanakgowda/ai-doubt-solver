import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

const rootRoute = createRootRoute({
  component: Layout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$chatId",
  component: ChatPage,
});

const routeTree = rootRoute.addChildren([loginRoute, homeRoute, chatRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const principal = identity?.getPrincipal();
  const isAuthenticated = loginStatus === "success" && !!principal;
  const isLoading = loginStatus === "logging-in";

  const shortPrincipal = principal
    ? `${principal.toString().slice(0, 5)}...${principal.toString().slice(-3)}`
    : null;

  return {
    login,
    logout: clear,
    identity,
    principal,
    shortPrincipal,
    isAuthenticated,
    isLoading,
    loginStatus,
  };
}

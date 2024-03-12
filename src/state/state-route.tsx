import { createRoot, createSignal } from "solid-js";

type routeT = "home" | "about";

function stateRoute() {
  const [route, setRoute] = createSignal<routeT>("home");

  return { route, setRoute };
}

export default createRoot(stateRoute);

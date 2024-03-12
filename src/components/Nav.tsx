import { BsExclamationCircle } from "solid-icons/bs";
import { VsHome } from "solid-icons/vs";
import { Show } from "solid-js";
import stateRoute from "~/state/state-route";

const Nav = () => {
  const { route, setRoute } = stateRoute;
  return (
    <div class="flex w-full items-center justify-end">
      <Show when={route() === "home"}>
        <button onClick={() => setRoute("about")}>
          <BsExclamationCircle class="size-5" />
        </button>
      </Show>
      <Show when={route() === "about"}>
        <button onClick={() => setRoute("home")}>
          <VsHome class="size-5" />
        </button>
      </Show>
    </div>
  );
};

export default Nav;

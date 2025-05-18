import pick from "lodash/pick";
import { useRef } from "react";
import { shallow } from "zustand/shallow";

type PickT<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Many<T> = T | readonly T[];

export function useSelector<S extends object, P extends keyof S>(
  paths: Many<P>
): (state: S) => PickT<S, P> {
  const prev = useRef<PickT<S, P>>({} as PickT<S, P>);

  return (state: S) => {
    if (state) {
      const next = pick(state, paths);
      if (shallow(prev.current, next)) {
        return prev.current;
      } else {
        prev.current = next;
        return next;
      }
    }
    return prev.current;
  };
}

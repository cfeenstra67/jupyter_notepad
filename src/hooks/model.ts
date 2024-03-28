import type { WidgetModel } from "@jupyter-widgets/base";
import {
  type DependencyList,
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";
import * as uuid from "uuid";

type ModelCallback = (models: WidgetModel, event: unknown) => void;

export interface ModelProviderProps {
  model: WidgetModel;
  children?: React.ReactNode;
}

export interface ModelContext<T> {
  Provider: (props: ModelProviderProps) => React.ReactElement;
  useModel: () => WidgetModel | undefined;
  useModelEvent: (
    event: string,
    callback: ModelCallback,
    deps?: DependencyList,
  ) => void;
  useModelState: <K extends string & keyof T>(
    name: K,
  ) => [T[K], (val: T[K]) => void];
  useTransport: () => (method: string, payload: unknown) => Promise<unknown>;
}

export function createModelContext<T>(): ModelContext<T> {
  const ctx = createContext<WidgetModel | undefined>(undefined);

  const useModel: ModelContext<T>["useModel"] = () => {
    return useContext(ctx);
  };

  const useModelEvent: ModelContext<T>["useModelEvent"] = (
    event,
    callback,
    deps,
  ) => {
    const model = useModel();

    const dependencies = deps === undefined ? [model] : [...deps, model];
    useEffect(() => {
      const callbackWrapper = (event: unknown) => {
        model && callback(model, event);
      };
      model?.on(event, callbackWrapper);
      return () => void model?.off(event, callbackWrapper);
    }, dependencies);
  };

  const useModelState: ModelContext<T>["useModelState"] = <
    K extends string & keyof T,
  >(
    name: K,
  ) => {
    const model = useModel();
    const [state, setState] = useState<T[K]>(model?.get(name));

    useModelEvent(
      `change:${name}`,
      (model) => {
        setState(model.get(name));
      },
      [name],
    );

    function updateModel(val: T[K], options?: unknown) {
      model?.set(name, val, options);
      model?.save_changes();
    }

    return [state, updateModel];
  };

  const useTransport: ModelContext<T>["useTransport"] = () => {
    const model = useModel();
    return async (method, payload) => {
      if (!model) {
        throw new Error("No transport connected");
      }
      const requestId = await new Promise<string>((resolve, reject) => {
        const request = {
          request_id: uuid.v4(),
          method,
          // biome-ignore lint/suspicious/noExplicitAny: easiest fix here
          payload: payload as any,
        };

        model.send(request, {
          iopub: {
            status: (msg) => {
              resolve(request.request_id);
            },
          },
        });

        setTimeout(() => reject(new Error("Request timed out")), 10000);
      });
      return await new Promise<void>((resolve, reject) => {
        const teardown = () => {
          model.off("msg:custom", listener);
        };

        const listener = (payload) => {
          if (payload?.request_id !== requestId) {
            return;
          }
          teardown();
          if (payload.success) {
            resolve(payload.payload);
          } else {
            reject(new Error(payload.error));
          }
        };

        model.on("msg:custom", listener);

        setTimeout(() => {
          teardown();
          reject(new Error("Request timed out"));
        }, 10000);
      });
    };
  };

  return {
    Provider: ({ model, children }) =>
      createElement(ctx.Provider, { value: model, children }),
    useModel,
    useModelEvent,
    useModelState,
    useTransport,
  };
}

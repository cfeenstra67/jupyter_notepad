import { DOMWidgetView } from "@jupyter-widgets/base";
import { QueryClient } from "@tanstack/react-query";
import { createElement } from "react";
import ReactDOM from "react-dom";
import Providers from "./components/Providers";
import Widget from "./components/Widget";

export class WidgetView extends DOMWidgetView {
  render() {
    const queryClient = new QueryClient();
    this.el.classList.add("flex-grow");

    const component = createElement(
      Providers,
      {
        model: this.model,
        queryClient,
      },
      createElement(Widget),
    );

    ReactDOM.render(component, this.el);
  }

  remove() {
    ReactDOM.unmountComponentAtNode(this.el);
  }
}

import { DOMWidgetView } from "@jupyter-widgets/base";
import { createElement } from "react";
import ReactDOM from "react-dom";
import Providers from "./components/Providers";
import Widget from "./components/Widget";

export class WidgetView extends DOMWidgetView {
  render() {
    const component = createElement(
      Providers,
      {
        model: this.model,
      },
      createElement(Widget),
    );

    ReactDOM.render(component, this.el);
  }

  remove() {
    ReactDOM.unmountComponentAtNode(this.el);
  }
}

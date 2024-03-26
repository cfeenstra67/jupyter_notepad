import { DOMWidgetView } from "@jupyter-widgets/base";
import { createElement } from "react";
import ReactDOM from "react-dom";
import Widget from "./components/Widget";
import { WidgetViewProvider } from "./lib/widget-model";

export class WidgetView extends DOMWidgetView {
  render() {
    const component = createElement(
      WidgetViewProvider,
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

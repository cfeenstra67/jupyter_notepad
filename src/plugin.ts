import { IJupyterWidgetRegistry } from "@jupyter-widgets/base";
import type { Application, IPlugin } from "@lumino/application";
import type { Widget } from "@lumino/widgets";
import { WidgetModel } from "./lib/widget-model";
import { MODULE_NAME, MODULE_VERSION } from "./version";
import { WidgetView } from "./widget";

const EXTENSION_ID = "jupyter-notepad:plugin";

const plugin: IPlugin<Application<Widget>, void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateWidgetExtension,
  autoStart: true,
} as unknown as IPlugin<Application<Widget>, void>;

export default plugin;

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(
  app: Application<Widget>,
  registry: IJupyterWidgetRegistry,
): void {
  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports: { WidgetModel, WidgetView },
  });
}

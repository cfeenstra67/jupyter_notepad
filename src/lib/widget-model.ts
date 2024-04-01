import { DOMWidgetModel, type ISerializers } from "@jupyter-widgets/base";
import { createModelContext } from "../hooks/model";
import { MODULE_NAME, MODULE_VERSION } from "../version";

export interface IWidgetModel {
  path: string;
  extension: string;
  code: string;
  height: number;
  is_dirty: boolean;
  show_line_numbers: boolean;
  head_commit: string | null;
  checkout_commit: string | null;
}

export const {
  Provider: WidgetViewProvider,
  useModel: useWidgetModel,
  useModelChange: useWidgetModelChange,
  useModelEvent: useWidgetModelEvent,
  useModelState: useWidgetModelState,
  useTransport: useWidgetTransport,
} = createModelContext<IWidgetModel>();

const defaultModelProperties: IWidgetModel = {
  path: "",
  extension: "",
  code: "",
  height: 4,
  is_dirty: false,
  show_line_numbers: false,
  head_commit: null,
  checkout_commit: null,
};

export class WidgetModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: WidgetModel.model_name,
      _model_module: WidgetModel.model_module,
      _model_module_version: WidgetModel.model_module_version,
      _view_name: WidgetModel.view_name,
      _view_module: WidgetModel.view_module,
      _view_module_version: WidgetModel.view_module_version,
      ...defaultModelProperties,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = "WidgetModel";
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = "WidgetView"; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

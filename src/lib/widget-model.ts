import { DOMWidgetModel, type ISerializers } from "@jupyter-widgets/base";
import { createModelContext } from "../hooks/model";
import { MODULE_NAME, MODULE_VERSION } from "../version";

export interface IWidgetModel {
  code: string;
  height: number;
  is_dirty: boolean;
}

export const {
  Provider: WidgetViewProvider,
  useModel: useWidgetModel,
  useModelEvent: useWidgetModelEvent,
  useModelState: useWidgetModelState,
  useTransport: useWidgetTransport,
} = createModelContext<IWidgetModel>();

const defaultModelProperties: IWidgetModel = {
  code: "",
  height: 4,
  is_dirty: false,
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

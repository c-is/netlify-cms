import { Map } from 'immutable';
import { oneLine } from 'common-tags';
import EditorComponent from 'ValueObjects/EditorComponent';

/**
 * Global Registry Object
 */
const registry = {
  backends: {},
  templates: {},
  previewStyles: [],
  widgets: {},
  editorComponents: Map(),
  widgetValueSerializers: {},
  mediaLibraries: [],
  entryCards: {},
};

export default {
  registerPreviewStyle,
  getPreviewStyles,
  registerPreviewTemplate,
  getPreviewTemplate,
  registerWidget,
  getWidget,
  resolveWidget,
  registerEditorComponent,
  getEditorComponents,
  registerWidgetValueSerializer,
  getWidgetValueSerializer,
  registerBackend,
  getBackend,
  registerMediaLibrary,
  getMediaLibrary,
  registerEntryCard,
  getEntryCard,
};

/**
 * Preview Styles
 *
 * Valid options:
 *  - raw {boolean} if `true`, `style` value is expected to be a CSS string
 */
export function registerPreviewStyle(style, opts) {
  registry.previewStyles.push({ ...opts, value: style });
}
export function getPreviewStyles() {
  return registry.previewStyles;
}

/**
 * Preview Templates
 */
export function registerPreviewTemplate(name, component) {
  registry.templates[name] = component;
}
export function getPreviewTemplate(name) {
  return registry.templates[name];
}

/**
 * Editor Widgets
 */
export function registerWidget(name, control, preview) {
  if (Array.isArray(name)) {
    name.forEach(widget => {
      if (typeof widget !== 'object') {
        console.error(`Cannot register widget: ${widget}`);
      } else {
        registerWidget(widget);
      }
    });
  } else if (typeof name === 'string') {
    // A registered widget control can be reused by a new widget, allowing
    // multiple copies with different previews.
    const newControl = typeof control === 'string' ? registry.widgets[control].control : control;
    registry.widgets[name] = { control: newControl, preview };
  } else if (typeof name === 'object') {
    const {
      name: widgetName,
      controlComponent: control,
      previewComponent: preview,
      globalStyles,
    } = name;
    if (registry.widgets[widgetName]) {
      console.error(oneLine`
        Multiple widgets registered with name "${widgetName}". Only the last widget registered with
        this name will be used.
      `);
    }
    if (!control) {
      throw Error(`Widget "${widgetName}" registered without \`controlComponent\`.`);
    }
    registry.widgets[widgetName] = { control, preview, globalStyles };
  } else {
    console.error('`registerWidget` failed, called with incorrect arguments.');
  }
}
export function getWidget(name) {
  return registry.widgets[name];
}
export function resolveWidget(name) {
  return getWidget(name || 'string') || getWidget('unknown');
}

/**
 * Markdown Editor Custom Components
 */
export function registerEditorComponent(component) {
  const plugin = EditorComponent(component);
  registry.editorComponents = registry.editorComponents.set(plugin.get('id'), plugin);
}
export function getEditorComponents() {
  return registry.editorComponents;
}

/**
 * Widget Serializers
 */
export function registerWidgetValueSerializer(widgetName, serializer) {
  registry.widgetValueSerializers[widgetName] = serializer;
}
export function getWidgetValueSerializer(widgetName) {
  return registry.widgetValueSerializers[widgetName];
}

/**
 * Backend API
 */
export function registerBackend(name, BackendClass) {
  if (!name || !BackendClass) {
    console.error(
      "Backend parameters invalid. example: CMS.registerBackend('myBackend', BackendClass)",
    );
  } else if (registry.backends[name]) {
    console.error(`Backend [${name}] already registered. Please choose a different name.`);
  } else {
    registry.backends[name] = {
      init: (...args) => new BackendClass(...args),
    };
  }
}

export function getBackend(name) {
  return registry.backends[name];
}

/**
 * Media Libraries
 */
export function registerMediaLibrary(mediaLibrary, options) {
  if (registry.mediaLibraries.find(ml => mediaLibrary.name === ml.name)) {
    throw new Error(`A media library named ${mediaLibrary.name} has already been registered.`);
  }
  registry.mediaLibraries.push({ ...mediaLibrary, options });
}

export function getMediaLibrary(name) {
  return registry.mediaLibraries.find(ml => ml.name === name);
}

export function registerEntryCard(collectionName, Component) {
  if (!collectionName || !Component) {
    console.error(
      "EntryCard parameters invalid. example: CMS.registerEntryCard('collection-name', Component)",
    );
  }
  registry.entryCards[collectionName] = Component;
}

export function getEntryCard(collectionName) {
  return registry.entryCards[collectionName];
}

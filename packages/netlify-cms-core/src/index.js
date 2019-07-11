import bootstrap from './bootstrap';
import Registry from 'Lib/registry';
import { NetlifyCmsUiDefault } from 'netlify-cms-ui-default';

export const NetlifyCmsCore = {
  ...Registry,
  styles: NetlifyCmsUiDefault,
  init: bootstrap,
};
export default NetlifyCmsCore;

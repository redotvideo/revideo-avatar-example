import {makeProject} from '@revideo/core';
import example from './scenes/example?scene';
import metadata from '../public/metadata.json';

export default makeProject({
  scenes: [example],
  variables: metadata
});

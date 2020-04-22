import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
// import compiler from '@ampproject/rollup-plugin-closure-compiler';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    sizeSnapshot(),
    // compiler({
    //   assume_function_wrapper: true,
    //   formatting: 'PRETTY_PRINT',
    // }),
    typescript({
      typescript: require('typescript'),
    }),
  ],
};

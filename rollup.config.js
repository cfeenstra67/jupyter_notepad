import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';

function plugins({
  ts
}) {
  return [
    postcss({
      config: {
        path: './postcss.config.js'
      },
      extensions: ['.css'],
      minimize: true,
      inject: {
        insertAt: 'top'
      }
    }),
    resolve(),
    commonjs(),
    typescript(ts),
    json(),
    svg(),
  ];
}

/** @type {import('rollup').RollupOptions[]} */
const configs = [
  {
    input: 'src/extension.ts',
    external: ['@jupyter-widgets/base'],
    output: {
      file: 'jupyter_notepad/nbextension/jupyter-notepad.js',
      inlineDynamicImports: true,
      format: 'amd',
      name: 'jupyter-notepad'
    },
    plugins: plugins({
      ts: { compilerOptions: { declaration: false, sourceMap: false, outDir: './jupyter_notepad/nbextension' } }
    }),
  },
  {
    input: ['src/index.ts', 'src/plugin.ts'],
    external: ['@jupyter-widgets/base'],
    output: {
      dir: 'dist',
      format: 'cjs'
    },
    plugins: plugins({
      ts: { compilerOptions: { declaration: false, sourceMap: false, outDir: './dist' } }
    })
  }
];

export default configs;

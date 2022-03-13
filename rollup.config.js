import nodeResolve from '@rollup/plugin-node-resolve';

export default {
    input: 'dist/start.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs',
    },
    plugins: [
        nodeResolve({
            modulesOnly: true,
        }),
    ],
};

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";

export default {
    input: "src/index.ts",
    // input: "src/test.js",
    output: {
        file: "built.js",
        format: "cjs",
    },
    plugins: [
        typescript(),
        commonjs(),
        babel({
            extensions: ["ts"],
            babelHelpers: "bundled",
        }),


        /*
         * terser({
         *     compress: false
         * }),
         */
    ],
};

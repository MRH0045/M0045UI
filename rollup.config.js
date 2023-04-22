// rollup.config.js
import peerDepsExternal from "rollup-plugin-peer-deps-external"; // 打包时排除 peer dependencies，减小组件库的体积
import resolve from "@rollup/plugin-node-resolve"; // 打包第三方依赖模块
import commonjs from "@rollup/plugin-commonjs"; // 
import typescript from "rollup-plugin-typescript2"; // 将 TypeScript 文件转换为 JavaScript。设置 "useTsconfigDeclarationDir": true 输出指定目录的 .d.ts 文件
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
const { babel } = require("@rollup/plugin-babel");
const packageJson = require("./package.json");
const less = require("less");

const isProd = process.env.NODE_ENV === "production";

const babelOptions = {
    presets: ["@babel/preset-env"],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.less'],
    exclude: "**/node_modules/**"
};

const processLess = function (context, payload) {
    return new Promise((resolve, reject) => {
        console.log('context', context);
        less.render(
            {
                file: context
            },
            function (err, result) {
                if (!err) {
                    resolve(result);
                } else {
                    reject(err);
                }
            }
        );
        less.render(context, {}).then(
            function (output) {
                if (output && output.css) {
                    resolve(output.css);
                } else {
                    reject({});
                }
            },
            function (err) {
                reject(err);
            }
        );
    });
};

export default {
    input: "stories/index.ts",
    output: [
        {
            file: packageJson.main,
            format: "cjs",
            sourcemap: true
        },
        {
            file: packageJson.module,
            format: "es",
            sourcemap: true
        }
    ],
    plugins: [
        peerDepsExternal({ includeDependencies: !isProd }),
        resolve(),
        commonjs({ sourceMap: !isProd }),
        typescript({ useTsconfigDeclarationDir: true }),
        postcss({
            extract: true,
            process: processLess
        }),
        babel(babelOptions),
        json()
    ],
};
const webpack = require('webpack');
const path = require('path');
const entry = require('webpack-glob-entry');

module.exports = (env) => {
    console.log(env);
    return {
        mode: (env && env.development) || 'production',
        devtool:
            'eval-source-map',
        entry:
            entry(entry.basePath('./app/jsx'), './app/jsx/**/*.jsx'),
        output:
            {
                path: path.resolve('./app/static/src/jsx/'),
                filename:
                    './[name].js',
                sourceMapFilename: "[name].js.map",
            }
        ,
        resolve: {
            extensions: ['.js', '.jsx', '.css']
        }
        ,
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.jsx?/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    options: {
                        presets: ["@babel/preset-react", '@babel/preset-env', {
                            plugins:
                                ["@babel/plugin-proposal-class-properties"]
                        },
                        ]
                    }
                }]
        }
        ,

        performance: {
            hints: false
        }
    }
};


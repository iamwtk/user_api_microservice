import path from 'path'
import nodeExternals from 'webpack-node-externals'
import webpack from 'webpack'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'



export default {
    entry: './src/server.js',
    output: {
        filename: 'server.js',
        path: path.join(__dirname, 'dist')
    },
    target: "node",
    node: {
        __dirname: false
    },
    mode: 'production',
    externals: [nodeExternals()], //exclude node_modules from bundling        
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: false,
                uglifyOptions: {
                    compress: false
                }
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
}
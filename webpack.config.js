module.exports = {
	entry: './client/App',
	output: {
		path: __dirname + '/static/dist',
		filename: 'bundle.js',
		publicPath: '/static/'
	},
	module: {
		loaders: [
			{
					test: /\.js$/,
					exclude: /node_modules/,
					loaders: ['babel']
			},
			{
					test: /\.scss$/,
					loaders: ['sass-loader']
			}
		]
	},
	watch: true
}
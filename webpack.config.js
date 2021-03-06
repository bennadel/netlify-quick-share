
// Using the dotenv package allows us to have local-versions of our ENV variables in a
// .env file while still using different build-time ENV variables in production.
require( "dotenv" ).config();

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

// Load the core node modules.
var AngularCompilerPlugin = require( "@ngtools/webpack" ).AngularCompilerPlugin;
var CleanWebpackPlugin = require( "clean-webpack-plugin" );
var HtmlWebpackPlugin = require( "html-webpack-plugin" );
var path = require( "path" );
var webpack = require( "webpack" );

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

// We are exporting a Function instead of a configuration object so that we can
// dynamically define the configuration object based on the execution mode.
module.exports = ( env, argv ) => {

	var isDevelopmentMode = ( argv.mode === "development" );

	// Locally, we want robust source-maps. However, in production, we want something
	// that can help with debugging without giving away all of the source-code. This
	// production setting will give us proper file-names and line-numbers for debugging;
	// but, without actually providing any code content.
	var devtool = isDevelopmentMode
		? "eval-source-map"
		: "nosources-source-map"
	;

	// By default, each module is identified based on Webpack's internal ordering. This
	// can cause issues for cache-busting and long-term browser caching as a localized
	// change can create a rippling effect on module identifiers. As such, we want to
	// identify modules based on a name that is order-independent. Both of the following
	// plugins do roughly the same thing; only, the one in development provides a longer
	// and more clear ID.
	var moduleIdentifierPlugin = isDevelopmentMode
		? new webpack.NamedModulesPlugin()
		: new webpack.HashedModuleIdsPlugin()
	;

	return({
		// I define the base-bundles that will be generated.
		// --
		// NOTE: There is no explicit "vendor" bundle. With Webpack 4, that level of
		// separation is handled by default. You just include your entry bundle and 
		// Webpack's splitChunks optimization DEFAULTS will automatically separate out
		// modules that are in the "node_modules" folder.
		entry: {
			main: "./src/app/main.ts"
			// NOTE: I'm currently including the polyfill directly in the main.ts file.
			// If I have it as an Entry, I get a "cyclic dependency" error since I had to
			// ALSO change my "chunksSortMode" to "none" in order to get Lazy Loading
			// modules to work.
			// --
			// polyfill: "./src/app/main.polyfill.ts",
		},
		// I define the bundle file-name scheme.
		output: {
			filename: "[name].[contenthash].js",
			path: path.join( __dirname, "build", "dist" ),
			publicPath: "dist/"
		},
		devtool: devtool,
		resolve: {
			extensions: [ ".ts", ".js" ],
			alias: {
				"~/app": path.resolve( __dirname, "src/app" )
			}
		},
		module: {
			rules: [
				// I provide a TypeScript compiler that performs Ahead of Time (AoT)
				// compilation for the Angular application and TypeScript code.
				{
					test: /(\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
					loader: "@ngtools/webpack"
				},
				// When the @ngtools webpack loader runs, it will replace the
				// @Component() "templateUrl" and "styleUrls" with inline "require()"
				// calls. As such, we need the raw-loader so that require() will know how
				// to load .htm and .css files as plain-text.
				{ 
					test: /\.(htm|css)$/, 
					loader: "raw-loader"
				},
				// If our components link to .less files instead of .css files, then the
				// less-loader will parse the LESS CSS file on-the-fly during the
				// require() call that is generated by the @ngtools webpack loader.
				{
					test: /\.less$/,
					loaders: [
						"raw-loader",
						"less-loader"
					]
				}
			]
		},
		plugins: [
			// I provide build-time values as global constants in the runtime so that
			// they can be consumed by the Angular application.
			// --
			// NOTE: This plug-in does a direct-text replacement in the source code. As
			// such, all string values must be explicitly quoted / stringified.
			new webpack.DefinePlugin({
				"process.env.NETLIFY_FUNCTIONS_ROOT": JSON.stringify( process.env.NETLIFY_FUNCTIONS_ROOT )
			}),

			// I clean the build directory before each build.
			new CleanWebpackPlugin(),

			// I work with the @ngtools webpack loader to configure the Angular compiler.
			new AngularCompilerPlugin({
				tsConfigPath: path.join( __dirname, "tsconfig.json" ),
				mainPath: path.join( __dirname, "src/app/main" ),
				entryModule: path.join( __dirname, "src/app/app.module#AppModule" ),
				// Webpack will generate source-maps independent of this setting. But,
				// this setting uses the original source code in the source-map, rather
				// than the generated / compiled code.
				sourceMap: true
			}),

			// I generate the main "index" file and inject Script tags for the files 
			// emitted by the compilation process.
			new HtmlWebpackPlugin({
				filename: "../../build/index.htm",
				template: "./src/app/main.htm",
				// CAUTION: I had to switch this to "none" when using Lazy Loading
				// modules otherwise I was getting a "Cyclic dependency" error in the
				// Toposort module in this plug-in. As a side-effect of this, I had to
				// start including the Polyfill file directly in the main.ts (as opposed
				// to including it as an entry point).
				// --
				// Read More: https://github.com/jantimon/html-webpack-plugin/issues/870
				chunksSortMode: "none"
			}),

			// I facilitate better caching for generated bundles.
			moduleIdentifierPlugin
		],
		optimization: {
			splitChunks: {
				// Apply optimizations to all chunks, even initial ones (not just the
				// ones that are lazy-loaded).
				chunks: "all"
			},
			// I pull the Webpack runtime out into its own bundle file so that the
			// contentHash of each subsequent bundle will remain the same as long as the
			// source code of said bundles remain the same.
			runtimeChunk: "single"
		}
	});

};

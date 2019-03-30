
// Using the dotenv allows us to have local-versions of our ENV variables in a .env
// file while still using the build-time ENV variables in production.
require( "dotenv" ).config();

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

// Require core node modules.
var AWS = require( "aws-sdk" );
var Buffer = require( "buffer" ).Buffer;
var cuid = require( "cuid" );

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

var s3 = new AWS.S3({
	accessKeyId: process.env.AWS_S3_ACCESS_KEY,
	secretAccessKey: process.env.AWS_S3_SECRET_KEY
});

exports.handler = function( event, context, callback ) {

	try {

		var body = parseBody( event.body, event.isBase64Encoded );

		var resourceKey = `uploads/${ cuid() }/${ body.clientFilename }`;

		var putParams = {
			Bucket: process.env.AWS_S3_BUCKET,
			Key:  resourceKey,
			Expires: ( 2 * 60 )
		};

		var getParams = {
			Bucket: process.env.AWS_S3_BUCKET,
			Key:  resourceKey,
			Expires: ( 60 * 60 )
		};

		var putUrl = s3.getSignedUrl( "getObject", putParams );
		var getUrl = s3.getSignedUrl( "getObject", getParams );

		var response = {
			statusCode: 200,
			body: JSON.stringify({
				putUrl: putUrl,
				getUrl: getUrl
			})
		};
		
	} catch ( error ) {

		console.error( error );

		var response = {
			statusCode: 400,
			body: JSON.stringify({
				message: "Request could not be processed."
			})
		};

	}

	callback( null, response );

}


// CAUTION: Throws error if body cannot be parsed as JSON.
function parseBody( body, isBase64Encoded ) {

	var normalizedBody = isBase64Encoded
		? fromBase64( body )
		: body
	;

	return( JSON.parse( normalizedBody ) );

}


function fromBase64( encodedValue ) {

	return( Buffer.from( encodedValue, "base64" ).toString( "utf8" ) );

}

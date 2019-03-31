
// Import the core angular services.
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

export interface SignedUrlsResponse {
	putUrl: string;
	getUrl: string;
}

// NOTE: The Netlify Functions (Lambda) root is provided as an environmental variable
// which is then made available in the Angular code via the DefinePlugin() for Webpack.
var NETLIFY_FUNCTIONS_ROOT = ( process.env.NETLIFY_FUNCTIONS_ROOT as "string" );

@Injectable({
	providedIn: "root"
})
export class SignedUrlService {

	private httpClient: HttpClient;

	// I initialize the signed-url service.
	constructor( httpClient: HttpClient ) {

		this.httpClient = httpClient;

	}

	// ---
	// PUBLIC METHODS.
	// ---

	// I get the GET and PUT urls for a file with the given name and type.
	public async getSignedUrls(
		clientFilename: string,
		mimeType: string
		) : Promise<SignedUrlsResponse> {

		var response = await this.httpClient
			.post<SignedUrlsResponse>(
				`${ NETLIFY_FUNCTIONS_ROOT }get-signed-urls`,
				{
					clientFilename: clientFilename,
					mimeType: mimeType
				}
			)
			.toPromise()
		;

		return( response );

	}

}

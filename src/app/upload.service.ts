
// Import the core angular services.
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// Import the application components and services.
import { SignedUrlService } from "./signed-url.service";

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

export interface UploadResponse {
	name: string;
	size: number;
	type: string;
	url: string;
}

@Injectable({
	providedIn: "root"
})
export class UploadService {

	private httpClient: HttpClient;
	private signedUrlService: SignedUrlService;

	// I initialize the upload service.
	constructor(
		httpClient: HttpClient,
		signedUrlService: SignedUrlService
		) {

		this.httpClient = httpClient;
		this.signedUrlService = signedUrlService;

	}

	// ---
	// PUBLIC METHODS.
	// ---

	// I upload the given File object and return a promise with the result.
	public async uploadFile( file: File ) : Promise<UploadResponse> {

		var urls = await this.signedUrlService.getSignedUrls( file.name, file.type );

		var putUrl = urls.putUrl;
		var getUrl = urls.getUrl;

		await this.httpClient
			.put<void>(
				putUrl,
				file,
				{
					headers: {
						"Content-Type": file.type
					}
				}
			)
			.toPromise()
		;

		return({
			name: file.name,
			size: file.size,
			type: file.type,
			url: getUrl
		});

	}

}

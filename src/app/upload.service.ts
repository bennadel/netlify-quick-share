
// Import the core angular services.
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

	private signedUrlService: SignedUrlService;

	// I initialize the upload service.
	constructor( signedUrlService: SignedUrlService ) {

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

		await this.sendFile( file, putUrl );

		return({
			name: file.name,
			size: file.size,
			type: file.type,
			url: getUrl
		});

	}

	// ---
	// PRIVATE METHODS.
	// ---

	// I send the given File to the given URL. Returns a promise.
	private sendFile(
		file: File,
		url: string
		) : Promise<void> {

		// CAUTION: For the purposes of this demo, I am using a simple upload algorithm.
		var promise = new Promise<void>(
			( resolve, reject ) => {

				var xhr = new XMLHttpRequest();

				xhr.upload.onload = ( event: ProgressEvent ) => {

					resolve();

				};

				xhr.upload.onerror = ( event: ProgressEvent ) => {

					reject();

				};
				xhr.upload.onabort = xhr.upload.onerror;
				xhr.upload.ontimeout = xhr.upload.onerror;

				xhr.open( "PUT", url );
				xhr.setRequestHeader( "Content-Type", file.type );
				xhr.send( file );

			}
		);

		return( promise );

	}

}

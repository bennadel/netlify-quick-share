
// Import the core angular services.
import { Component } from "@angular/core";

// Import the application components and services.
import { UploadResponse } from "./upload.service";
import { UploadService } from "./upload.service";

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

@Component({
	selector: "my-app",
	styleUrls: [ "./app.component.less" ],
	template:
	`
		<label for="fileInput" class="upload">
			<span class="upload__label">
				Click to Select File
			</span>

			<input
				#fileInput
				id="fileInput"
				type="file"
				class="upload__input"
				(change)="uploadFiles( fileInput.files ) ; fileInput.value = null;"
			/>
		</label>

		<h2>
			Uploads
		</h2>

		<ul *ngIf="uploads.length">
			<li *ngFor="let upload of uploads">
				<a [href]="upload.url" target="_blank">{{ upload.name }}</a>
			</li>
		</ul>

		<p *ngIf="( ! uploads.length )">
			<em>No files have been uploaded yet.</em>
		</p>
	`
})
export class AppComponent {

	public uploads: UploadResponse[];

	private uploadService: UploadService;

	// I initialize the app component.
	constructor( uploadService: UploadService ) {

		this.uploadService = uploadService;

		this.uploads = [];

	}

	// ---
	// PUBLIC METHODS.
	// ---

	// I initiate an upload request for each of the given files.
	public async uploadFiles( files: any ) : Promise<void> {

		for ( var file of files ) {

			try {

				var response = await this.uploadService.uploadFile( file );

				this.uploads.push( response );

			} catch ( error ) {

				console.group( "Upload Failed" );
				console.warn( "There was an issue uploading the file." );
				console.log( "File:", file.name );
				console.error( error );
				console.groupEnd();

			}

		}

	}

}

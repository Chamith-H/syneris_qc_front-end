import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from "@angular/core";
import { SingleFileUploadModel } from "src/app/core/models/shared/file-upload.model";
import { BucketService } from "src/app/core/services/app-services/bucket/bucket.service";

@Component({
  selector: "app-doc-upload",
  templateUrl: "./doc-upload.component.html",
  styleUrls: ["./doc-upload.component.scss"],
})
export class DocUploadComponent {
  @Output() closePopup = new EventEmitter<any>();
  @Output() closePopupAndReload = new EventEmitter<any>();

  @ViewChild("fileInput", { static: true }) fileInput: ElementRef;
  @Output() imageFile: EventEmitter<any> = new EventEmitter<any>();

  // Currently showing image
  isImage: boolean = false;
  selectedImage: string | ArrayBuffer | null = null;

  finalFile: any = null;

  constructor(private bucketService: BucketService) {}

  //!--> Image handlers...................................................................|
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];

    if (file) {
      this.finalFile = file;

      const isImage = file.type.startsWith("image/");

      if (isImage) {
        this.isImage = true;
        this.handleFile(file);
      } else {
        this.isImage = false;
      }
    }
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];

    if (file) {
      console.log(file.name);
      this.finalFile = file;
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        this.isImage = true;
        this.handleFile(file);
      } else {
        this.isImage = false;
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  //!--> Image processors..................................................................|
  // Get file
  handleFile(file: File | null) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.selectedImage = event.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadDocument() {
    const formData = new FormData();
    formData.append("file", this.finalFile);

    this.bucketService.uploadFile(formData).subscribe({
      next: (bucketResponse: any) => {
        console.log(bucketResponse);

        const body = {
          download: bucketResponse.data.downloadPage,
          name: bucketResponse.data.name,
          folder: bucketResponse.data.parentFolderCode,
          id: bucketResponse.data.id,
          md5: bucketResponse.data.md5,
          type: bucketResponse.data.mimetype,
          server: bucketResponse.data.servers[0],
        };
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}

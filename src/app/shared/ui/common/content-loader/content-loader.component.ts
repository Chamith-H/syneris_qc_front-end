import { Component, Input } from "@angular/core";

@Component({
  selector: "app-content-loader",
  templateUrl: "./content-loader.component.html",
  styleUrls: ["./content-loader.component.scss"],
})
export class ContentLoaderComponent {
  @Input() loadText: string = "";
}

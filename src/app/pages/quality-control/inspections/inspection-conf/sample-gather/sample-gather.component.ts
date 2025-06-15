import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { sMsg } from "src/app/core/models/shared/success-response.model";
import { InspectionService } from "src/app/core/services/app-services/operations/inspection.service";
import { SuccessMessage } from "src/app/core/services/shared/success-message.service";

@Component({
  selector: "app-sample-gather",
  templateUrl: "./sample-gather.component.html",
  styleUrls: ["./sample-gather.component.scss"],
})
export class SampleGatherComponent {
  @Input() sampleCols: any[] = [];
  @Input() sampleValues: any[] = [];
  @Input() parameterData: any[] = [];
  @Input() data: any = null;
  @Input() stage: string = "";

  @Output() closePopup = new EventEmitter<any>();
  @Output() closePopupAndReload = new EventEmitter<any>();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inspectionService: InspectionService,
    private successMessageService: SuccessMessage
  ) {}

  get rows(): FormArray {
    return this.form.get("rows") as FormArray;
  }

  createSampleDataGroup(rowData: any): FormGroup {
    const group = this.fb.group({});
    this.sampleCols.forEach((col) => {
      group.addControl(col.colValue, this.fb.control(rowData[col.colValue]));
    });
    return group;
  }

  loadTableData() {
    this.parameterData.forEach((rowData) => {
      const sampleDataGroup = this.createSampleDataGroup(rowData);

      const rowGroup = this.fb.group({
        parameter: [rowData.parameter._id],
        sampleData: this.fb.array([sampleDataGroup]),
      });

      this.rows.push(rowGroup);
    });
  }

  getSampleDataControl(rowIndex: number, controlName: string) {
    const rowGroup = this.rows.at(rowIndex);
    const sampleDataArray = rowGroup.get("sampleData") as FormArray;
    const firstSampleGroup = sampleDataArray.at(0) as FormGroup;
    return firstSampleGroup.get(controlName);
  }

  isSampling: boolean = false;

  submit() {
    this.isSampling = true;

    const body = {
      stage: this.stage,
      itemCode: this.data.ItemCode,
      docNum: this.data.DocNum,
      round: this.data.U_Round,
      parameterValues: this.form.value,
    };

    this.inspectionService.createSamples(body).subscribe({
      next: (data: sMsg) => {
        this.isSampling = false;
        this.successMessageService.show(data.message);
        this.closePopupAndReload.emit();
      },
      error: (err) => {
        console.log(err);
        this.isSampling = false;
      },
    });
  }

  ngOnInit() {
    console.log(this.data);
    this.form = this.fb.group({
      rows: this.fb.array([]),
    });
    this.loadTableData();
  }
}

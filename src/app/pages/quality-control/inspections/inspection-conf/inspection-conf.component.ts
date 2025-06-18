import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { InspectionService } from "src/app/core/services/app-services/operations/inspection.service";
import { SuccessMessage } from "src/app/core/services/shared/success-message.service";
import Swal from "sweetalert2";
import { SampleGatherComponent } from "./sample-gather/sample-gather.component";
import { DateShower } from "src/app/core/services/shared/date-shower.service";
import { GetActionComponent } from "./get-action/get-action.component";

@Component({
  selector: "app-inspection-conf",
  templateUrl: "./inspection-conf.component.html",
  styleUrls: ["./inspection-conf.component.scss"],
})
export class InspectionConfComponent {
  @Input() data: any = null;
  @Input() stage: string = "";

  @Output() closePopup = new EventEmitter<any>();
  @Output() closePopupAndReload = new EventEmitter<any>();

  modalRef?: BsModalRef;

  booleanDrops = [
    {
      name: "Yes",
      _id: "Yes",
    },
    { name: "No", _id: "No" },
  ];

  sampleCols: string[] = [];
  parameterData: any[] = [];

  sampleMethods = [
    {
      name: "Single sample test",
      _id: "Single-Test",
    },
    {
      name: "Multi sample test",
      _id: "Multi-Test",
    },
  ];

  form2: FormGroup;
  isSubmit_form2: boolean = false;

  form3: FormGroup;
  isSubmit_form3: boolean = false;
  itemsFormBuilder: FormBuilder = new FormBuilder();

  isSaving: boolean = false;

  constructor(
    private inspectionService: InspectionService,
    private successMessage: SuccessMessage,
    private modalService: BsModalService,
    public fb: FormBuilder,
    public toastr: ToastrService,
    public dateShower: DateShower
  ) {
    this.form2 = this.fb.group({
      method: [null, [Validators.required]],
      sampleCount: [null, [Validators.required]],
    });

    this.form3 = this.fb.group({
      DocumentLines: this.createitemList(),
    });
  }

  changeMethod() {
    const method = this.form2.value.method;

    if (method === "Single-Test") {
      this.form2.get("sampleCount").setValue(1);
    } else {
      this.form2.get("sampleCount").setValue(2);
    }
  }

  createitemList(): FormArray {
    return this.itemsFormBuilder.array([]);
  }

  // ✅ UPDATED createItemRow
  createItemRow(parameter: any): FormGroup {
    return this.fb.group({
      parameterId: [parameter.parameterId, [Validators.required]],
      parameterName: [parameter.parameterIdenity],
      uom: [parameter.parameterUom],
      category: [parameter.parameterCategory],
      type: [parameter.parameterType],
      mandatory: [parameter.mandatory],
      minValue: [parameter.minValue],
      maxValue: [parameter.maxValue],
      stdValue: [parameter.stdValue],
      samplingData: this.fb.array(
        parameter.samplingData.map((sample: any) =>
          this.fb.group({
            sampleId: [sample.sampleId],
            sampleName: [sample.sampleName],
            sampleIndex: [sample.sampleIndex],
            observedValue: [sample.observedValue, Validators.required],
          })
        )
      ),
    });
  }

  get itemList(): FormArray {
    return this.form3.get("DocumentLines") as FormArray;
  }

  // ✅ NEW helper
  getSamplingData(formGroup: FormGroup): FormArray {
    return formGroup.get("samplingData") as FormArray;
  }

  isStarting: boolean = false;

  getDate() {
    return this.dateShower.viewDate();
  }

  startInspection() {
    this.isStarting = true;

    const body = {
      stageName: "GRN",
      docNum: this.data.DocNum,
      itemCode: this.data.ItemCode,
      line: this.data.Line,
      method: this.form2.value.method,
      sampleCount: this.form2.value.sampleCount,
    };

    this.inspectionService.startInspection(body).subscribe({
      next: (data: any) => {
        const itemParameterMapper = data.values.map((i_param: any) => {
          const matching = data.sampleValues.find(
            (s: any) => s.parameterId === i_param.parameterId
          );
          return {
            ...i_param,
            samplingData: matching?.samplingData || [],
          };
        });

        this.isStarting = false;
        this.sampleCols = data.samples;
        this.parameterData = itemParameterMapper;

        this.modalRef = this.modalService.show(SampleGatherComponent, {
          initialState: {
            sampleCols: data.samples,
            parameterData: itemParameterMapper,
            sampleValues: data.sampleValues,
            data: this.data,
            stage: this.stage,
          },
          backdrop: "static",
          class: "modal-xl modal-dialog-centered",
        });

        this.modalRef.content.closePopup.subscribe(() => {
          this.modalRef.hide();
        });

        this.modalRef.content.closePopupAndReload.subscribe(() => {
          this.modalRef.hide();
          this.closePopupAndReload.emit();
        });
      },
      error: (err) => {
        console.log(err);
        this.isStarting = false;
      },
    });
  }

  valueFetcher(
    category: string,
    type: string,
    minValue: string,
    maxValue: string,
    stdValue: string
  ) {
    if (category === "Fixed") {
      if (type === "Percentage") {
        return `X = ${stdValue}%`;
      } else {
        return `X = ${stdValue}`;
      }
    } else if (category === "Range") {
      if (type === "Percentage") {
        return `${minValue}% < X < ${maxValue}%`;
      } else {
        return `${minValue} < X < ${maxValue}`;
      }
    } else if (category === "Grater-Than") {
      if (type === "Percentage") {
        return `${minValue}% < X`;
      } else {
        return `${minValue} < X`;
      }
    } else if (category === "Less-Than") {
      if (type === "Percentage") {
        return `${maxValue}% > X`;
      } else {
        return `${maxValue} > X`;
      }
    } else {
      return `X = ${stdValue}`;
    }
  }

  loadingItems: boolean = false;

  onReset() {}

  flattenSamplingData(): any[] {
    const documentLines = this.form3.value.DocumentLines;
    const allSamplingData: any[] = [];

    documentLines.forEach((line: any) => {
      if (line.samplingData && Array.isArray(line.samplingData)) {
        allSamplingData.push(...line.samplingData);
      }
    });

    return allSamplingData;
  }

  submit_form3() {
    this.isSaving = true;
    const flatSamplingData = this.flattenSamplingData();

    const body = {
      data: flatSamplingData,
    };

    this.inspectionService.saveData(body).subscribe({
      next: (data: any) => {
        this.isSaving = false;
        this.itemList.clear();

        this.loadingItems = true;

        const body = {
          stageName: "GRN",
          docNum: this.data.DocNum,
          itemCode: this.data.ItemCode,
          round: this.data.U_Round,
        };

        this.inspectionService.checkingItems(body).subscribe({
          next: (data: any) => {
            this.loadingItems = false;

            if (data.length > 0) {
              this.sampleCols = data[0].samplingData.map((s) => s.sampleName);
            }

            data.forEach((m_data: any) => {
              this.itemList.push(this.createItemRow(m_data));
            });
          },
          error: (err) => {
            console.log(err);
            this.loadingItems = false;
          },
        });
      },
      error: (err) => {
        console.log(err);
        this.isSaving = false;
      },
    });
  }

  loadingOpend: boolean = false;

  checkIsDrop(rowData: any) {
    if (!rowData) {
      return false;
    }
    console.log(this.parameterData);
    // const parameter = this.parameterData.find(
    //   (param: any) => param.parameter._id === rowData.value.parameterId

    // );

    // console.log(parameter.parameter.type);

    // if (!parameter) {
    //   return false;
    // }

    // if (parameter.parameter.type === "Boolean") {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  getAction(action: string) {
    this.modalRef = this.modalService.show(GetActionComponent, {
      initialState: {
        action: action,
        id: this.data._id,
        data: this.data,
        stage: this.stage,
      },
      backdrop: "static",
      class: "modal-lg modal-dialog-centered",
    });

    this.modalRef.content.closePopup.subscribe(() => {
      this.modalRef.hide();
    });

    this.modalRef.content.closePopupAndReload.subscribe(() => {
      this.modalRef.hide();
      this.closePopupAndReload.emit();
    });
  }

  ngOnInit() {
    if (this.data.U_Approval === "Open") {
      this.loadingOpend = true;

      const body = {
        stageName: this.stage,
        itemCode: this.data.ItemCode,
      };

      this.inspectionService.startConf(body).subscribe({
        next: (data: any) => {
          this.loadingOpend = false;
          this.form2.patchValue(data);
        },
        error: (err) => {
          console.log(err);
          this.loadingOpend = false;
        },
      });
    }

    if (this.data.U_Approval === "Pending") {
      this.loadingItems = true;

      const body = {
        stageName: "GRN",
        docNum: this.data.DocNum,
        itemCode: this.data.ItemCode,
        round: this.data.U_Round,
      };

      this.inspectionService.checkingItems(body).subscribe({
        next: (data: any) => {
          this.loadingItems = false;

          if (data.length > 0) {
            this.sampleCols = data[0].samplingData.map((s) => s.sampleName);
          }

          data.forEach((m_data: any) => {
            this.itemList.push(this.createItemRow(m_data));
          });
        },
        error: (err) => {
          console.log(err);
          this.loadingItems = false;
        },
      });
    }
  }
}

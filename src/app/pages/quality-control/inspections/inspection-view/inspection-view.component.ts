import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { InspectionService } from "src/app/core/services/app-services/operations/inspection.service";
import { SuccessMessage } from "src/app/core/services/shared/success-message.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-inspection-view",
  templateUrl: "./inspection-view.component.html",
  styleUrls: ["./inspection-view.component.scss"],
})
export class InspectionViewComponent {
  @Input() data: any = null;
  @Input() parameters: any[] = [];

  @Output() closePopup = new EventEmitter<any>();
  @Output() closePopupAndReload = new EventEmitter<any>();

  form3: FormGroup;
  isSubmit_form3: boolean = false;
  itemsFormBuilder: FormBuilder = new FormBuilder();

  isSaving: boolean = false;

  constructor(
    private inspectionService: InspectionService,
    private successMessage: SuccessMessage,
    public fb: FormBuilder,
    public toastr: ToastrService
  ) {
    this.form3 = this.fb.group({
      DocumentLines: this.createitemList(),
    });
  }

  createitemList(): FormArray {
    return this.itemsFormBuilder.array([]);
  }

  createItemRow(
    checkingId: string,
    parameterName: string,
    parameterCode: string,
    uom: string,
    mandatory: boolean,
    category: string,
    type: string,
    minValue: string,
    maxValue: string,
    stdValue: string,
    observedValue: string
  ): FormGroup {
    return this.fb.group({
      checkingId: [checkingId, [Validators.required]],
      parameterName: [parameterName],
      parameterCode: [parameterCode],
      uom: [uom],
      category: [category],
      type: [type],
      mandatory: [mandatory],
      minValue: [minValue],
      maxValue: [maxValue],
      stdValue: [stdValue],
      observedValue: [observedValue],
    });
  }

  get itemList(): FormArray {
    return this.form3.get("DocumentLines") as FormArray;
  }

  isStarting: boolean = false;

  startInspection() {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to start the inspection?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, start it!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.isStarting = true;

        const body = {
          stageName: "GRN",
          docNum: this.data.DocNum,
          itemCode: this.data.ItemCode,
          line: this.data.Line,
        };

        this.inspectionService.startInspection(body).subscribe({
          next: (data: any) => {
            this.isStarting = false;

            this.successMessage.show(data.message);
            this.data.U_Approval = "Pending";
            this.parameters = data.data;

            console.log(data.data);
          },
          error: (err) => {
            console.log(err);
            this.isStarting = false;
          },
        });
      }
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

  submit_form3() {
    this.isSaving = true;

    const body = {
      stageName: "GRN",
      docNum: this.data.DocNum,
      itemCode: this.data.ItemCode,
      line: this.data.Line,
      obsData: this.form3.value.DocumentLines,
    };

    this.inspectionService.updateObserveds(body).subscribe({
      next: (data: any) => {
        this.isSaving = false;

        this.itemList.clear();

        data.map((m_data: any) => {
          this.itemList.push(
            this.createItemRow(
              m_data._id,
              m_data.parameter.name,
              m_data.parameter.code,
              m_data.parameter.uom.code + " - " + m_data.parameter.uom.name,
              m_data.mandatory,
              m_data.parameter.category,
              m_data.parameter.type,
              m_data.minValue,
              m_data.maxValue,
              m_data.stdValue,
              m_data.observedValue
            )
          );
        });
      },
      error: (err) => {
        console.log(err);
        this.isSaving = false;
      },
    });
  }

  ngOnInit() {
    if (this.data.U_Approval === "Pending") {
      this.loadingItems = true;

      const body = {
        stageName: "GRN",
        docNum: this.data.DocNum,
        itemCode: this.data.ItemCode,
        line: this.data.Line,
      };

      this.inspectionService.checkingItems(body).subscribe({
        next: (data: any) => {
          this.loadingItems = false;

          data.map((m_data: any) => {
            this.itemList.push(
              this.createItemRow(
                m_data._id,
                m_data.parameter.name,
                m_data.parameter.code,
                m_data.parameter.uom.code + " - " + m_data.parameter.uom.name,
                m_data.mandatory,
                m_data.parameter.category,
                m_data.parameter.type,
                m_data.minValue,
                m_data.maxValue,
                m_data.stdValue,
                m_data.observedValue
              )
            );
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

import { CdkStepper } from "@angular/cdk/stepper";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Behavior } from "src/app/core/enums/shared-enums/behavior.enum";
import { sMsg } from "src/app/core/models/shared/success-response.model";
import { QcParameterService } from "src/app/core/services/app-services/quality-control/qc-parameter.service";
import { StageService } from "src/app/core/services/app-services/quality-control/stage.service";
import { SuccessMessage } from "src/app/core/services/shared/success-message.service";

@Component({
  selector: "app-relation-setter",
  templateUrl: "./relation-setter.component.html",
  styleUrls: ["./relation-setter.component.scss"],
})
export class RelationSetterComponent {
  @Input() mode: Behavior.CREATE_MODE;
  @Input() data: any;

  @Output() closePopup = new EventEmitter<any>();
  @Output() closePopupAndReload = new EventEmitter<any>();

  @ViewChild(CdkStepper) stepper!: CdkStepper;
  index: number = 0;

  form2: FormGroup;
  isSubmit_form2: boolean = false;
  submittingForm_form2: boolean = false;
  complete_form2: boolean = false;

  form3: FormGroup;
  isSubmit_form3: boolean = false;
  itemsFormBuilder: FormBuilder = new FormBuilder();
  complete_form3: boolean = false;

  parameters: any[] = [];
  loadingParameters: boolean = false;

  sampleMethods = [
    {
      name: "Single sample test",
      _id: "Single-Test"
    },
        {
      name: "Multi sample test",
      _id: "Multi-Test"
    },
  ]

  constructor(
    public fb: FormBuilder,
    public toastr: ToastrService,
    private successMessage: SuccessMessage,
    private stageService: StageService,
    private qcParameterService: QcParameterService
  ) {
    this.form2 = this.fb.group({
      itemCode: [null, [Validators.required]],
      method: ["Single-Test", [Validators.required]],
      sampleCount: [1, [Validators.required]]
    });

    this.form3 = this.fb.group({
      DocumentLines: this.createitemList(),
    });
  }

  changeMethod() {
    const method = this.form2.value.method

    if(method === 'Single-Test') {
      this.form2.get('sampleCount').setValue(1)
    }else {
      this.form2.get('sampleCount').setValue(2)
    }
  }

  createitemList(): FormArray {
    return this.itemsFormBuilder.array([]);
  }

  createItemRow(
    parameterId: string,
    mandatory: boolean,
    minValue: string,
    maxValue: string,
    stdValue: string,
    status: boolean
  ): FormGroup {
    return this.fb.group({
      parameterId: [parameterId, [Validators.required]],
      mandatory: [mandatory],
      minValue: [minValue],
      maxValue: [maxValue],
      stdValue: [stdValue],
      status: [status],
    });
  }

  get itemList(): FormArray {
    return this.form3.get("DocumentLines") as FormArray;
  }

  itemData: any[] = [];
  isItemDataLoading: boolean = false;

  changeItem() {}

  getParamDataCategory(parameterId: string) {
    if (!parameterId) {
      return "__";
    }

    const parameter = this.parameters.find(
      (param: any) => param._id === parameterId
    );

    return parameter.category;
  }

  getParamDataType(parameterId: string) {
    if (!parameterId) {
      return "__";
    }

    const parameter = this.parameters.find(
      (param: any) => param._id === parameterId
    );

    return parameter.type;
  }

  getParamDataCode(parameterId: string) {
    if (!parameterId) {
      return "__";
    }

    const parameter = this.parameters.find(
      (param: any) => param._id === parameterId
    );

    return parameter.code;
  }

  getParamDataName(parameterId: string) {
    if (!parameterId) {
      return "__";
    }

    const parameter = this.parameters.find(
      (param: any) => param._id === parameterId
    );

    return parameter.name;
  }

  createRow() {
    this.itemList.push(this.createItemRow(null, false, "", "", "", true));
  }

  getItemName(itemCode: string) {
    const item = this.itemData.find(
      (i_data: any) => i_data.ItemCode === itemCode
    );

    return item.ItemName;
  }

  submit_form2() {
    this.isSubmit_form2 = true;

    if (this.form2.invalid) {
      this.toastr.error("Please select a item code!");
      return;
    } else {
      this.stepper.next();
    }
  }

  disableMin(parameterId: string) {
    if (!parameterId) {
      return true;
    } else {
      const parameter = this.parameters.find(
        (param: any) => param._id === parameterId
      );

      const p_category = parameter.category;

      if (p_category === "Range" || p_category === "Grater-Than") {
        return false;
      } else {
        return true;
      }
    }
  }

  disableMax(parameterId: string) {
    if (!parameterId) {
      return true;
    } else {
      const parameter = this.parameters.find(
        (param: any) => param._id === parameterId
      );

      const p_category = parameter.category;

      if (p_category === "Range" || p_category === "Less-Than") {
        return false;
      } else {
        return true;
      }
    }
  }

  disableStd(parameterId: string) {
    if (!parameterId) {
      return true;
    } else {
      const parameter = this.parameters.find(
        (param: any) => param._id === parameterId
      );

      const p_category = parameter.category;

      if (p_category === "Fixed") {
        return false;
      } else {
        return true;
      }
    }
  }

  submit_form3() {
    this.isSubmit_form3 = true;

    if (this.form3.invalid) {
      this.toastr.error("Please select a parameter!");
      return;
    } else {
      if (this.itemList.controls.length === 0) {
        this.toastr.error("Please add at least one parameter row!");
        return;
      } else {
        const error1 = this.itemList.value.find(
          (item: any) =>
            this.getParamDataCategory(item.parameterId) === "Range" &&
            (item.minValue === "" || item.maxValue === "")
        );

        if (error1) {
          this.toastr.error("Please fill all red color fields!");
          return;
        }

        const error2 = this.itemList.value.find(
          (item: any) =>
            item.minValue === "" && item.maxValue === "" && item.stdValue === ""
        );

        if (error2) {
          this.toastr.error("Please fill all red color fields!");
          return;
        } else {
          this.stepper.next();
        }
      }
    }
  }

  getItems() {
    this.isItemDataLoading = true;

    this.stageService.getItems().subscribe({
      next: (data: any[]) => {
        this.isItemDataLoading = false;
        this.itemData = data;
      },
      error: (err) => {
        console.log(err);
        this.isItemDataLoading = false;
      },
    });
  }

  getParameters() {
    this.loadingParameters = true;

    this.qcParameterService.dropdownParameter().subscribe({
      next: (data: any[]) => {
        this.loadingParameters = false;
        this.parameters = data;
      },
      error: (err) => {
        console.log(err);
        this.loadingParameters = false;
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

  isSaving: boolean = false;

  saveData() {
    const body = {
      stage: "GRN",
      ...this.form2.value,
      parameterLines: this.form3.value.DocumentLines,
    };

    this.isSaving = true;

    this.stageService.createItemParameter(body).subscribe({
      next: (data: sMsg) => {
        this.isSaving = false;
        this.successMessage.show(data.message);
        this.closePopupAndReload.emit();
      },
      error: (err) => {
        console.log(err);
        this.isSaving = false;
      },
    });
  }

  form2Completer() {
    if (this.itemList.controls.length === 0) {
      return false;
    } else {
      const error1 = this.itemList.value.find(
        (item: any) =>
          this.getParamDataCategory(item.parameterId) === "Range" &&
          (item.minValue === "" || item.maxValue === "")
      );

      if (error1) {
        return false;
      }

      const error2 = this.itemList.value.find(
        (item: any) =>
          item.minValue === "" && item.maxValue === "" && item.stdValue === ""
      );

      if (error2) {
        return false;
      } else {
        return true;
      }
    }
  }

  ngOnInit() {
    this.getItems();
    this.getParameters();
  }
}

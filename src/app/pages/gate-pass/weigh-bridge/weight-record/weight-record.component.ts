import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { sMsg } from "src/app/core/models/shared/success-response.model";
import { WeighBridgeService } from "src/app/core/services/app-services/gate-pass/weigh-bridge.service";
import { SuccessMessage } from "src/app/core/services/shared/success-message.service";

@Component({
  selector: "app-weight-record",
  templateUrl: "./weight-record.component.html",
  styleUrls: ["./weight-record.component.scss"],
})
export class WeightRecordComponent {
  @Input() id: string;
  @Input() data: any;

  @Output() closePopup = new EventEmitter<any>();
  @Output() closePopupAndReload = new EventEmitter<any>();

  isSubmitting: boolean = false;
  weightForm: FormGroup;
  isSubmit: boolean = false;

  constructor(
    public fb: FormBuilder,
    public toastr: ToastrService,
    private successMessage: SuccessMessage,
    private weightBridgeService: WeighBridgeService
  ) {
    this.weightForm = this.fb.group({
      firstWeight: [null],
      secondWeight: [null],
    });
  }

  onSubmit() {
    this.isSubmit = true;
    this.isSubmitting = true;

    const body = {
      id: this.id,
      ...this.weightForm.value,
    };

    this.weightBridgeService.weightRecord(body).subscribe({
      next: (res: sMsg) => {
        this.successMessage.show(res.message);
        this.closePopupAndReload.emit();
        this.isSubmit = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.log(err);
        this.isSubmitting = false;
      },
    });
  }

  resetFields() {}

  ngOnInit() {
    const formData = {
      firstWeight: this.data.firstWeight,
      secondWeight: this.data.secondWeight,
    };

    this.weightForm.patchValue(formData);
  }
}

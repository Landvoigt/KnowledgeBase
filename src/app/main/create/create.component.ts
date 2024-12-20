import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { AlertService } from '@services/alert.service';
import { ErrorService } from '@services/error.service';
import { RestService } from '@services/rest.service';
import { createForm, CreateFormModel } from '@interfaces/create.interface';
import { fadeIn } from '@utils/animations';
import { CommandRequest } from '@models/requests.model';
import { data, Item } from '@models/command.model';
import { concatMap, from } from 'rxjs';
import { DIRECT_ACTIVATION_PASSWORD } from 'src/config/config';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  animations: [fadeIn]
})
export class CreateComponent implements OnInit {
  public createForm: FormGroup<CreateFormModel> = createForm();

  loading: boolean = false;
  closeMenu: boolean = false;
  newCatSelected: boolean = false;

  adminMode: boolean = false;

  data: any = data;

  constructor(
    private restService: RestService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  get name() {
    return this.createForm.get('name');
  }

  get email() {
    return this.createForm.get('email');
  }

  get body() {
    return this.createForm.get('body') as FormGroup;
  }

  get category() {
    return this.body.get('category');
  }

  get newType() {
    return this.body.get('newType');
  }

  get command() {
    return this.body.get('command');
  }

  get description() {
    return this.body.get('description');
  }

  get message() {
    return this.createForm.get('message');
  }

  ngOnInit(): void {
    this.category?.valueChanges.subscribe(() => {
      this.checkNewCategorySelection();
    });
  }

  checkNewCategorySelection() {
    const selectedType = this.category?.value;
    this.newCatSelected = selectedType === 'new';
  }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }

  onSubmit() {
    if (this.createForm.valid) {
      const { name, email, message } = this.createForm.value;
      const bodyValue = this.body.value;

      if (this.category && this.newType?.value != null) {
        bodyValue.category = this.newType.value;
      }

      const commandPayload: CommandRequest = this.adminMode ? this.getAdminRequest(bodyValue) : this.getRequest(bodyValue, name, email, message);

      this.loading = true;
      this.restService.createCommand(commandPayload).subscribe({
        next: (response) => {
          this.alertService.showAlert('Thank you for your submission!', 'success');
          this.createForm.reset();
          this.loading = false;
        },
        error: (err) => {
          this.errorService.handleContactError(err);
          this.loading = false;
        },
      });
    }
  }

  onBatchSubmit() {
    if (!this.data || this.data.length === 0) {
      this.alertService.showAlert('No items to submit.', 'warning');
      return;
    }

    this.loading = true;

    from(this.data)
      .pipe(
        concatMap((item: any) => {
          item.param = DIRECT_ACTIVATION_PASSWORD;
          const adminRequest: CommandRequest = this.getAdminRequest(item);
          return this.restService.createCommand(adminRequest);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Item submitted successfully', response);
        },
        error: (err) => {
          this.errorService.handleContactError(err);
        },
        complete: () => {
          this.alertService.showAlert('All items were submitted successfully!', 'success');
          this.loading = false;
        },
      });
  }

  getRequest(bodyValue: any, name: string | null | undefined, email: string | null | undefined, message: string | null | undefined) {
    return {
      command: bodyValue.command,
      category: bodyValue.category,
      sub_category: bodyValue.subType || '',
      description: bodyValue.description,
      example: bodyValue.example || '',
      param: bodyValue.param || '',
      creator_name: name || undefined,
      creator_email: email || undefined,
      creator_message: message || '',
    };
  }

  getAdminRequest(bodyValue: any) {
    return {
      command: bodyValue.command,
      category: bodyValue.category,
      sub_category: bodyValue.subType || '',
      description: bodyValue.description,
      example: bodyValue.example || '',
      param: bodyValue.param || '',
      creator_name: "ADMIN",
      creator_email: "timvoigt1996@gmail.com",
      creator_message: "admin",
    };
  }
}
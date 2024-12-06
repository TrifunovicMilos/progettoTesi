import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  title: string;
  message: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) {
    this.title = data.title;
    this.message = data.message;
  }

  // nella funzione onLogout() della Dashboard, questa funzione fa diventare true "result" di 
  // "if (result) {this.authService.logout()}"  
  // e quindi fa sì che venga chiamata authService.logout() 
  onConfirm(): void {
    this.dialogRef.close(true); 
  }

  onDismiss(): void {
    this.dialogRef.close(false); 
  }
}

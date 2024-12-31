import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-progressi-studente',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatTabsModule, MatCardModule, MatFormFieldModule, FormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule ],
  templateUrl: './progressi-studente.component.html',
  styleUrl: './progressi-studente.component.css'
})
export class ProgressiStudenteComponent implements OnInit {
  isLoading = true;
  uid! : string;

  esami: any[] = [];
  tipiTest: any[] = [];
  testData: any[] = [];
  filteredTestData: any[] = [];
  filter = {
    esame: '',
    tipoTest: '',
    data: null
  };
  
  selectedEsame: any;
  tipiTestForSelectedEsame: any[] = [];

  totalTests = 0;
  totalMediaVoti = 0;
  filteredMediaVoti = 0;
  mediaVoti = 0;
  displayedColumns: string[] = ['esame', 'tipoTest', 'data', 'voto'];

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.getUserObservable().subscribe(userData => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
        const ruolo = this.authService.getUserRole();
        // se non sono uno studente di questo esame visualizzo un errore
        if (!(ruolo === 'studente'))
          this.router.navigate(['404'])
        else
          this.loadData().then(() => {
            this.isLoading = false;
          });
      }
    });
  }

  async loadData() {
    try {
      const esami = await this.firebaseService.getExamService().getEsami(); 

      this.testData = await this.firebaseService.getTestService().getStudentTests(this.uid);

      // Estrai tutti i tipi di test unici
      const tipoTestIds = [...new Set(this.testData.map(test => test.tipoTest))];

      const tipiTestPromises = tipoTestIds.map(id => this.firebaseService.getTestService().getTipoTestById(id));
      this.tipiTest = await Promise.all(tipiTestPromises);
      this.tipiTestForSelectedEsame = this.tipiTest;

      for (let test of this.testData) {
  
        const tipoTest = this.tipiTest.find(t => t.id === test.tipoTest);
        test.tipoTest = tipoTest ? { id: tipoTest.id, nomeTest: tipoTest.nomeTest } : { id: '', nomeTest: 'Tipo di test sconosciuto' };
        
        const esame = esami.find(e => Array.isArray(e.tipiTest) && e.tipiTest.includes(test.tipoTest.id));  
        test.esame = esame ? { id: esame.id, titolo: esame.titolo } : { id: '', titolo: 'Esame sconosciuto' };
      }

      // Estrai solo gli esami dei quali ho svolto test
      const esamiIds = [...new Set(this.testData.map(test => test.esame.id))];

      const esamiPromises = esamiIds.map(id => this.firebaseService.getExamService().getEsameById(id));
      this.esami = await Promise.all(esamiPromises);

      this.filteredTestData = [...this.testData];

      this.calculateStats();
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.isLoading = false;
    }
  }

  applyFilter() {
    this.filteredTestData = this.testData.filter(test => {
      const matchesEsame = this.filter.esame ? test.esame.id === this.filter.esame : true;
      const matchesTipoTest = this.filter.tipoTest ? test.tipoTest.id === this.filter.tipoTest : true;
      const matchesData = this.filter.data ? new Date(test.data).toLocaleDateString() === new Date(this.filter.data).toLocaleDateString() : true;
      
      return matchesEsame && matchesTipoTest && matchesData;
    });
    this.calculateStats();
  }

  onEsameChange() {
    // Quando cambia l'esame, aggiorniamo i tipi di test disponibili
    this.selectedEsame = this.esami.find(e => e.id === this.filter.esame);
    if (this.selectedEsame) {
      this.tipiTestForSelectedEsame = this.tipiTest.filter(tipoTest => this.selectedEsame.tipiTest.includes(tipoTest.id));
      this.filter.tipoTest = ''; 
    } else {
      this.tipiTestForSelectedEsame = this.tipiTest;
      this.filter.tipoTest = '';  
    }
    this.applyFilter(); 
  }

  clearFilters() {
    this.filter = {
      esame: '',
      tipoTest: '',
      data: null
    };
    this.filteredTestData = [...this.testData];
    this.tipiTestForSelectedEsame = this.tipiTest;
    this.calculateStats();
    
  }


  calculateStats() {
    this.totalTests = this.testData.length;
    this.totalMediaVoti = this.testData.reduce((acc, test) => acc + test.voto, 0) / this.totalTests;

    const filteredTests = this.filteredTestData;
    this.filteredMediaVoti = filteredTests.reduce((acc, test) => acc + test.voto, 0) / filteredTests.length;

    this.mediaVoti = this.filteredMediaVoti;
  }

}

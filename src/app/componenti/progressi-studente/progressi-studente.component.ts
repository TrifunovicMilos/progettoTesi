import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { FirebaseService } from '../../servizi/firebase/firebase.service';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-progressi-studente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatTabsModule, MatFormFieldModule, FormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule, MatSlideToggleModule, MatPaginatorModule ],
  templateUrl: './progressi-studente.component.html',
  styleUrl: './progressi-studente.component.css'
})

export class ProgressiStudenteComponent implements OnInit {
  isLoading = true;
  isTableVisible = true;

  uid!: string;

  esami: any[] = [];
  tipiTest: any[] = [];
  testData: any[] = [];
  realTestData: any[] = [];
  filteredTestData: any[] = [];
  paginatedData: any[] = [];
  filter = {
    esame: '',
    tipoTest: '',
    data: null,
  };

  selectedEsame: any;
  tipiTestForSelectedEsame: any[] = [];

  totalTests = 0;
  differentTests = 0;
  totalMediaVoti = 0;
  realMediaVoti = 0;
  filteredMediaVoti = 0;

  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  displayedColumns: string[] = ['esame', 'tipoTest', 'data', 'voto'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor( private firebaseService: FirebaseService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUserObservable().subscribe((userData) => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
        const ruolo = this.authService.getUserRole();
        // se non sono uno studente di questo esame visualizzo un errore
        if (!(ruolo === 'studente')) this.router.navigate(['404']);
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

      // Ordina i test in ordine decrescente di data (più recenti in cima)
      this.testData = this.testData.reverse();

      // Estrai tutti i tipi di test unici
      const tipoTestIds = [...new Set(this.testData.map((test) => test.tipoTest)),];

      const tipiTestPromises = tipoTestIds.map((id) =>this.firebaseService.getTestService().getTipoTestById(id));
      this.tipiTest = await Promise.all(tipiTestPromises);
      this.tipiTestForSelectedEsame = this.tipiTest;

      for (let test of this.testData) {
        const tipoTest = this.tipiTest.find((t) => t.id === test.tipoTest);
        test.tipoTest = tipoTest ? { id: tipoTest.id, nomeTest: tipoTest.nomeTest } : { id: '', nomeTest: '' };

        const esame = esami.find((e) => Array.isArray(e.tipiTest) && e.tipiTest.includes(test.tipoTest.id));
        test.esame = esame ? { id: esame.id, titolo: esame.titolo } : { id: '', titolo: '' };
      }

      // Seleziona l'ultimo test per ogni tipo di test
      const latestTestsByTipoTest = new Map<string, any>();
      for (let test of this.testData) {
        // Sovrascrivi la mappa: l'ultimo test è quello che rimane perché sono in ordine cronologico
        latestTestsByTipoTest.set(test.tipoTest.id, test);
      }

      // Estrai i test più recenti
      this.realTestData = Array.from(latestTestsByTipoTest.values());

      // Estrai solo gli esami dei quali ho svolto test
      const esamiIds = [...new Set(this.testData.map((test) => test.esame.id))];

      const esamiPromises = esamiIds.map((id) => this.firebaseService.getExamService().getEsameById(id));
      this.esami = await Promise.all(esamiPromises);

      this.filteredTestData = [...this.testData];

      this.updatePageSizeOptions();
      this.applyPagination();
      this.calculateStats();
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.isLoading = false;
    }
  }

  toggleTableVisibility() {
    this.isTableVisible = !this.isTableVisible;
  }

  updatePageSizeOptions() {
    if (this.filteredTestData.length > 50) {
      this.pageSizeOptions = [5, 10, 25, 50, this.filteredTestData.length];
    } else {
      this.pageSizeOptions = [5, 10, 25, 50];
    }
  }

  applyPagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredTestData.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }

  applyFilter() {
    this.filteredTestData = this.testData.filter((test) => {
      const matchesEsame = this.filter.esame ? test.esame.id === this.filter.esame : true;
      const matchesTipoTest = this.filter.tipoTest ? test.tipoTest.id === this.filter.tipoTest : true;
      const matchesData = this.filter.data ? new Date(test.data).toLocaleDateString() === 
      new Date(this.filter.data).toLocaleDateString() : true;

      return matchesEsame && matchesTipoTest && matchesData;
    });
    this.pageIndex = 0;
    this.applyPagination();
    this.calculateStats();
  }

  onEsameChange() {
    // Quando cambia l'esame, aggiorniamo i tipi di test disponibili
    this.selectedEsame = this.esami.find((e) => e.id === this.filter.esame);
    if (this.selectedEsame) {
      this.tipiTestForSelectedEsame = this.tipiTest.filter((tipoTest) => this.selectedEsame.tipiTest.includes(tipoTest.id));
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
      data: null,
    };
    this.filteredTestData = [...this.testData];
    this.tipiTestForSelectedEsame = this.tipiTest;
    this.pageIndex = 0;
    this.applyPagination();
    this.calculateStats();
  }

  calculateStats() {
    this.totalTests = this.testData.length;
    this.totalMediaVoti = this.testData.reduce((acc, test) => acc + test.voto, 0) / this.totalTests;

    this.differentTests = this.realTestData.length;
    this.realMediaVoti = this.realTestData.reduce((acc, test) => acc + test.voto, 0) / this.differentTests;

    const filteredTests = this.filteredTestData;
    this.filteredMediaVoti = filteredTests.reduce((acc, test) => acc + test.voto, 0) / filteredTests.length;
  }

  getCircleColor(value: number): string {
    if (value < 50) {
      return '#e53935'; // Rosso
    } else if (value < 60) {
      return '#ffb74d'; // Arancione
    } else if (value < 75) {
      return '#ffee58'; // Giallo
    } else if (value < 90) {
      return '#66bb6a'; // Verde chiaro
    } else {
      return '#43a047'; // Verde scuro
    }
  }
}

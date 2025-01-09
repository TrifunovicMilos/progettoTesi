import { Component, OnInit, ViewChild} from '@angular/core';
import { Chart } from 'chart.js/auto';
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
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-docente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatTableModule, MatTabsModule, MatFormFieldModule, FormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule, MatSlideToggleModule, MatPaginatorModule],
  templateUrl: './report-docente.component.html',
  styleUrl: './report-docente.component.css'
})
export class ReportDocenteComponent {
  isLoading = true;
  isTableVisible = true;

  uid!: string;

  esami: any[] = [];
  tipiTest: any[] = [];
  testData: any[] = [];
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
  totalVotiMedia = 0;

  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  displayedColumns: string[] = ['esame', 'tipoTest', 'data', 'voto'];

  sortColumn: string = 'data';
  sortDirection: 'asc' | 'desc' = 'desc'; 

  constructor( private firebaseService: FirebaseService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUserObservable().subscribe((userData) => {
      if (userData) {
        this.uid = this.authService.getUid() || '';
        const ruolo = this.authService.getUserRole();
        // se non sono un docente visualizzo un errore
        if (!(ruolo === 'docente')) this.router.navigate(['404']);
        else
          this.loadData().then(() => {
            this.isLoading = false;
          });
      }
    });
  }

  async loadData() {
    try {
      // tutti gli esami del docente
      this.esami = await this.firebaseService.getExamService().getUserEsami(this.uid, 'docente');

      // ottieni tutti i test
      let allTests: any[] = [];
      for (const esame of this.esami) {
        const tests = await this.firebaseService.getTestService().getAllTestsByEsame(esame.id);
        allTests = allTests.concat(tests); 
      }

      this.testData = allTests;
      this.filteredTestData = [...this.testData];

      // Estrai tutti i tipi di test unici
      const tipoTestIds = [...new Set(this.testData.map((test) => test.tipoTest)),];

      const tipiTestPromises = tipoTestIds.map((id) =>this.firebaseService.getTestService().getTipoTestById(id));
      this.tipiTest = await Promise.all(tipiTestPromises);
      this.tipiTestForSelectedEsame = this.tipiTest;

      for (let test of this.testData) {
        const tipoTest = this.tipiTest.find((t) => t.id === test.tipoTest);
        test.tipoTest = tipoTest ? { id: tipoTest.id, nomeTest: tipoTest.nomeTest } : { id: '', nomeTest: '' };

        const esame = this.esami.find((e) => Array.isArray(e.tipiTest) && e.tipiTest.includes(test.tipoTest.id));
        test.esame = esame ? { id: esame.id, titolo: esame.titolo } : { id: '', titolo: '' };
      }

      this.tipiTest.sort((a, b) => a.nomeTest.localeCompare(b.nomeTest));
      this.esami.sort((a, b) => a.titolo.localeCompare(b.titolo));

      this.sortData();

      this.updatePageSizeOptions();
      this.applyPagination();
      // this.calculateStats();
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.isLoading = false;
    }
  }

  invertSortData(column: string): void {
    if (this.sortColumn === column) {
      // Se la colonna su cui stiamo ordinando è la stessa, invertiamo la direzione
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Se cambiamo colonna, settiamo la direzione su "asc"
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  
    this.filteredTestData = this.filteredTestData.sort((a, b) => {
      let comparison = 0;
  
      // Eseguiamo il confronto in base alla colonna selezionata
      if (this.sortColumn === 'esame') {
        comparison = a.esame.titolo.localeCompare(b.esame.titolo);
      } else if (this.sortColumn === 'tipoTest') {
        comparison = a.tipoTest.nomeTest.localeCompare(b.tipoTest.nomeTest);
      } else if (this.sortColumn === 'data') {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        comparison = dateA > dateB ? 1 : (dateA < dateB ? -1 : 0);
      } else if (this.sortColumn === 'voto') {
        comparison = a.voto - b.voto;
      }
  
      // Se la direzione è discendente, invertiamo il risultato
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  
    this.pageIndex = 0; // Reset della pagina ogni volta che ordiniamo
    this.applyPagination(); // Rappresentiamo i dati ordinati
  }

  sortData(): void {
  
    this.filteredTestData = this.filteredTestData.sort((a, b) => {
      let comparison = 0;
  
      // Eseguiamo il confronto in base alla colonna selezionata
      if (this.sortColumn === 'esame') {
        comparison = a.esame.titolo.localeCompare(b.esame.titolo);
      } else if (this.sortColumn === 'tipoTest') {
        comparison = a.tipoTest.nomeTest.localeCompare(b.tipoTest.nomeTest);
      } else if (this.sortColumn === 'data') {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        comparison = dateA > dateB ? 1 : (dateA < dateB ? -1 : 0);
      } else if (this.sortColumn === 'voto') {
        comparison = a.voto - b.voto;
      }
  
      // Se la direzione è discendente, invertiamo il risultato
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  
    this.pageIndex = 0; // Reset della pagina ogni volta che ordiniamo
    this.applyPagination(); // Rappresentiamo i dati ordinati
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

    this.sortData();
    
    this.pageIndex = 0;
    this.applyPagination();
    // this.calculateStats();

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
    // this.calculateStats();
    this.sortData()
  }

}

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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SidebarService } from '../../servizi/sidebar.service';

@Component({
  selector: 'app-report-docente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatTableModule, MatTabsModule, MatFormFieldModule, FormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule, MatSlideToggleModule, MatPaginatorModule, MatAutocompleteModule],
  templateUrl: './report-docente.component.html',
  styleUrl: './report-docente.component.css'
})
export class ReportDocenteComponent {
  isLoading = true;
  isTableVisible = true;
  isSidebarOpen = false;

  uid!: string;

  esami: any[] = [];
  tipiTest: any[] = [];
  studenti: any[] = [];
  testData: any[] = [];
  realTestData: any[] = [];
  filteredTestData: any[] = [];
  paginatedData: any[] = [];
  filter = {
    esame: '',
    tipoTest: '',
    studente: '',
    data: null,
  };

  selectedEsame: any;
  tipiTestForSelectedEsame: any[] = [];

  filteredStudenti: string[] = [];
  selectedStudent: string = '';
  showMinCharMessage = false;

  totalTests = 0;
  differentTests = 0;
  totalMediaVoti = 0;
  realMediaVoti = 0;
  filteredMediaVoti = 0;
  filteredRealMediaVoti = 0;

  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  displayedColumns: string[] = [
    'studente',
    'esame',
    'tipoTest',
    'data',
    'voto',
  ];

  sortColumn: string = 'data';
  sortDirection: 'asc' | 'desc' = 'desc';

  // grafico
  chartFilter = {
    esame: '',
    tipoTest: '',
    studente: '',
  };

  tipiTestForChart: any[] = [];
  chart: any;
  noChartData = false;

  chartTestCount = 0;
  chartTestAverage = 0;
  chartTestMax = 0;
  chartTestMin = 0;

  filteredChartStudenti: string[] = [];
  selectedChartStudent: string = '';
  showMinCharMessageChart = false;
  filteredNumberStudents = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private sidebarService: SidebarService, private router: Router) {}

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

    this.sidebarService.sidebarState$.subscribe(state => {
      this.isSidebarOpen = state; 
    });
  }

  async loadData() {
    try {
      // tutti gli esami del docente che contengono almeno un test
      this.esami = await this.firebaseService.getExamService().getUserEsami(this.uid, 'docente');
      this.esami = this.esami.filter(
        (esame) => esame.tipiTest && esame.tipiTest.length > 0
      );

      // ottieni tutti i test
      let allTests: any[] = [];
      for (const esame of this.esami) {
        const tests = await this.firebaseService.getTestService().getAllTestsByEsame(esame.id);

        // Filtra i test completati
        const completedTests = tests.filter((test) => test.voto >= 0);
        allTests = allTests.concat(completedTests);
      }

      this.testData = allTests;

      // oridna i test per data
      this.testData.sort((a, b) => {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        return dateA.getTime() - dateB.getTime();
      });

      // Estra tutti gli studenti
      this.studenti = [...new Set(this.testData.map((test) => test.studente))];

      // Estrai tutti i tipi di test unici
      const tipoTestIds = [...new Set(this.testData.map((test) => test.tipoTest)),];

      const tipiTestPromises = tipoTestIds.map((id) =>
        this.firebaseService.getTestService().getTipoTestById(id)
      );
      this.tipiTest = await Promise.all(tipiTestPromises);
      this.tipiTestForSelectedEsame = this.tipiTest;
      this.tipiTestForChart = this.tipiTest;
      this.differentTests = this.tipiTest.length;

      // assegna ad ogni test il nome del suo tipoTest tramite il suo tipoTest ID, stessa cosa per l'esame
      for (let test of this.testData) {
        const tipoTest = this.tipiTest.find((t) => t.id === test.tipoTest);
        test.tipoTest = tipoTest ? { id: tipoTest.id, nomeTest: tipoTest.nomeTest }: { id: '', nomeTest: '' };

        const esame = this.esami.find((e) => Array.isArray(e.tipiTest) && e.tipiTest.includes(test.tipoTest.id));
        test.esame = esame ? { id: esame.id, titolo: esame.titolo } : { id: '', titolo: '' };
      }

      // Seleziona l'ultimo test per ogni combinazione di tipoTest.id e studente
      const latestTestsByTipoTestAndStudente = new Map<string, any>();

      for (let test of this.testData) {
        // Crea una chiave unica per tipoTest.id e studente
        const key = `${test.tipoTest.id}-${test.studente}`;

        // Controlla se esiste già un test per questa combinazione
        if (latestTestsByTipoTestAndStudente.has(key)) {
          const existingTest = latestTestsByTipoTestAndStudente.get(key);

          // Confronta le date per mantenere il test più recente
          if (new Date(test.data) > new Date(existingTest.data)) {
            latestTestsByTipoTestAndStudente.set(key, test);
          }
        } else {
          // Aggiungi il test alla mappa se la chiave non esiste
          latestTestsByTipoTestAndStudente.set(key, test);
        }
      }

      // Estrai i test più recenti
      this.realTestData = Array.from(latestTestsByTipoTestAndStudente.values());

      this.tipiTest.sort((a, b) => a.nomeTest.localeCompare(b.nomeTest));
      this.esami.sort((a, b) => a.titolo.localeCompare(b.titolo));

      this.filteredTestData = [...this.testData];

      this.sortData();

      this.updatePageSizeOptions();
      this.applyPagination();
      this.calculateStats();
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
        comparison = dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
      } else if (this.sortColumn === 'voto') {
        comparison = a.voto - b.voto;
      } else if (this.sortColumn === 'studente') {
        comparison = a.studente.localeCompare(b.studente);
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
        comparison = dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
      } else if (this.sortColumn === 'voto') {
        comparison = a.voto - b.voto;
      } else if (this.sortColumn === 'studente') {
        comparison = a.studente.localeCompare(b.studente);
      }

      // Se la direzione è discendente, invertiamo il risultato
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.pageIndex = 0; // Reset della pagina ogni volta che ordiniamo
    this.applyPagination(); // Rappresentiamo i dati ordinati
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

  onStudentInput(event: any) {
    const input = event.target.value.toLowerCase();
    if (input.length < 1) {
      this.showMinCharMessage = input.length > 0;
      this.filteredStudenti = [];
    } 
    else {
      this.showMinCharMessage = false;
      this.filteredStudenti = this.studenti.filter((student) =>
        student.toLowerCase().includes(input)
      );
    } 
  }

  selectStudent(student: string) {
    this.selectedStudent = student;
    this.filter.studente = student;
    this.filteredStudenti = []
    this.applyFilter();
  }

  clearStudentInput() {
    this.selectedStudent = '';
    this.filter.studente = '';
    this.applyFilter();
  }

  applyFilter() {
    this.filteredTestData = this.testData.filter((test) => {
      const matchesEsame = this.filter.esame ? test.esame.id === this.filter.esame : true;
      const matchesTipoTest = this.filter.tipoTest ? test.tipoTest.id === this.filter.tipoTest : true;
      const matchesStudente = this.filter.studente ? test.studente === this.filter.studente : true;
      const matchesData = this.filter.data ? 
      new Date(test.data).toLocaleDateString() === new Date(this.filter.data).toLocaleDateString() : true;

      return matchesEsame && matchesTipoTest && matchesStudente && matchesData;
    });

    this.sortData();

    this.pageIndex = 0;
    this.applyPagination();
    this.calculateStats();
  }

  onEsameChange() {
    // Quando cambia l'esame, aggiorniamo i tipi di test disponibili
    this.selectedEsame = this.esami.find((e) => e.id === this.filter.esame);
    if (this.selectedEsame) {
      this.tipiTestForSelectedEsame = this.tipiTest.filter((tipoTest) =>
        this.selectedEsame.tipiTest.includes(tipoTest.id)
      );
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
      studente: '',
      data: null,
    };
    this.selectedStudent = '';
    this.filteredStudenti = [];
    this.filteredTestData = [...this.testData];
    this.tipiTestForSelectedEsame = this.tipiTest;
    this.pageIndex = 0;
    this.applyPagination();
    this.calculateStats();
    this.sortData();
  }

  calculateStats() {
    this.totalTests = this.testData.length;
    this.totalMediaVoti = this.testData.reduce((acc, test) => acc + test.voto, 0) / this.totalTests;

    const differentTests = this.realTestData.length;
    this.realMediaVoti = this.realTestData.reduce((acc, test) => acc + test.voto, 0) / differentTests;

    const filteredTests = this.filteredTestData;
    this.filteredMediaVoti = filteredTests.reduce((acc, test) => acc + test.voto, 0) / filteredTests.length;

    const filteredRealTests = filteredTests.filter((test) => this.realTestData.includes(test));
    this.filteredRealMediaVoti = filteredRealTests.reduce((acc, test) => acc + test.voto, 0) / filteredRealTests.length;
  }

  getCircleColor(value: number): string {
    if (value <= 50) {
      return '#e53935'; // Rosso
    } else if (value < 60) {
      return '#ffb74d'; // Arancione
    } else if (value < 75) {
      return '#fdd835'; // Giallo
    } else if (value < 90) {
      return '#66bb6a'; // Verde chiaro
    } else {
      return '#43a047'; // Verde scuro
    }
  }

  onChartEsameChange() {
    const selectedEsame = this.esami.find((e) => e.id === this.chartFilter.esame);
    if (selectedEsame) {
      this.tipiTestForChart = this.tipiTest.filter((tipo) =>
        selectedEsame.tipiTest.includes(tipo.id)
      );
    } else {
      this.tipiTestForChart = this.tipiTest;
    }
    this.chartFilter.tipoTest = '';
    this.updateChart();
  }

  clearChartFilters() {
    this.chartFilter = {
      esame: '',
      tipoTest: '',
      studente: '',
    };
    this.selectedChartStudent = '';
    this.filteredChartStudenti = [];
    this.chartFilter.studente = '';
    this.updateChart();
  }

  updateChart() {
    const filteredData = this.testData.filter((test) => {
      const matchesEsame = this.chartFilter.esame ? test.esame.id === this.chartFilter.esame : true;
      const matchesTipoTest = this.chartFilter.tipoTest ? test.tipoTest.id === this.chartFilter.tipoTest : true;
      const matchesStudente = this.chartFilter.studente ? test.studente === this.chartFilter.studente : true;

      return matchesEsame && matchesTipoTest && matchesStudente;
    });

    if (filteredData.length == 0)
    this.noChartData = true;
    else
    this.noChartData = false;

    this.filteredNumberStudents  = [...new Set(filteredData.map((test) => test.studente))].length;

    this.chartTestCount = filteredData.length;
    this.chartTestAverage = filteredData.reduce((sum, test) => sum + test.voto, 0) / (filteredData.length || 1);
    this.chartTestMax = Math.max(...filteredData.map((test) => test.voto));
    this.chartTestMin = Math.min(...filteredData.map((test) => test.voto));

    const labels = filteredData.map((test) => new Date(test.data).toLocaleDateString());
    const data = filteredData.map((test) => test.voto);

    // dati mostrati al passaggio del mouse sul punto del grafico
    const tooltipData = filteredData.map((test) => ({
      voto: test.voto,
      data: new Date(test.data).toLocaleString(),
      studente: test.studente,
      esame: test.esame.titolo,
      tipoTest: test.tipoTest.nomeTest,
    }));

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('votiChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Voto',
            data,
            borderColor: '#3e95cd',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Data',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Voto',
            },
            beginAtZero: true,
            max: 100,
            afterDataLimits: (axis) => {
              axis.max += 10; // Aggiunge margine oltre il massimo
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: function () {
                // Rimuove il titolo predefinito del tooltip (la data senza ora presente nelle ascisse)
                return '';
              },
              label: function (context) {
                const index = context.dataIndex;
                const info = tooltipData[index];
                return [
                  `Voto: ${info.voto}`,
                  `Data: ${info.data}`,
                  `Studente: ${info.studente}`,
                  `Esame: ${info.esame}`,
                  `Test: ${info.tipoTest}`,
                ];
              },
            },
            // Disabilita il logo accanto al campo "Voto"
            displayColors: false,
          },
        },
      },
    });
  }

  onChartStudentInput(event: any) {
    const input = event.target.value.toLowerCase();
    if (input.length < 1) {
      this.showMinCharMessageChart = input.length > 0;
      this.filteredChartStudenti = [];
    } 
    else {
      this.showMinCharMessageChart = false;
      this.filteredChartStudenti = this.studenti.filter((student) =>
        student.toLowerCase().includes(input)
      );
    }   
  }

  selectChartStudent(student: string) {
    this.selectedChartStudent = student;
    this.chartFilter.studente = student;
    this.updateChart();
  }

  clearChartStudentInput() {
    this.selectedChartStudent = '';
    this.chartFilter.studente = '';
    this.filteredChartStudenti = [];
    this.updateChart();
  }

  ngAfterViewInit() {
    // Aspetta che il DOM sia completamente pronto
    this.waitForCanvas('votiChart')
      .then(() => {
        this.updateChart();
      })
      .catch((err) =>
        console.error("Errore durante l'attesa del canvas:", err)
      );
  }

  // Funzione per aspettare che il canvas sia pronto, per risolvere errore: "Failed to create chart: can't acquire context from the given item"
  private waitForCanvas(id: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const checkCanvas = () => {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            resolve(canvas);
          } else {
            reject(
              new Error(
                `Impossibile acquisire il contesto 2D per il canvas con id "${id}".`
              )
            );
          }
        } else {
          setTimeout(checkCanvas, 50); // Ritenta dopo un breve ritardo
        }
      };
      checkCanvas();
    });
  }
}

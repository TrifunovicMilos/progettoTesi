# MyTestMate

## Progettazione e sviluppo di una piattaforma di apprendimento online

---

## Indice
1. [Descrizione del Progetto](#descrizione-del-progetto)
2. [Installazione e Configurazione](#installazione-e-configurazione)
3. [Licenza](#licenza)

---

## Descrizione del Progetto

**MyTestMate** è una piattaforma di apprendimento online progettata per supportare studenti e docenti nella preparazione e gestione degli esami.

La piattaforma consente agli studenti di iscriversi agli esami, svolgere test di preparazione e
monitorare i propri progressi, mentre i docenti possono configurare e gestire esami e test personalizzati, oltre ad analizzare le performance degli studenti.

Il progetto utilizza **Angular** per il frontend e **Firebase** per gestire l'autenticazione, il database e l'hosting.

La piattaforma è disponibile online all'indirizzo [https://progetto-tesi-4278e.web.app](https://progetto-tesi-4278e.web.app).
Se si desidera eseguire il progetto in locale, è possibile clonarlo e seguire i passaggi di installazione descritti nella sezione successiva.

---

## Installazione e Configurazione

### Prerequisiti

- Node.js v18+
- Angular CLI v18+
- Account Firebase

### Passaggi per avviare il progetto

1. Clona il repository:
   ```bash
   git clone https://github.com/TrifunovicMilos/progettoTesi
   cd progettoTesi
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   npm install chart.js
   ```

3. Configura Firebase:
   - Crea un progetto Firebase e abilita l'autenticazione e il Firestore.
   - Nei file presenti in src/environments sostituisci i campi vuoti con le informazioni che trovi nelle Impostazioni del progetto di Firebase.

4. Avvia il server di sviluppo:
   ```bash
   ng serve
   ```
   L'app sarà disponibile su `http://localhost:4200`.

---

## Licenza

Questo progetto è distribuito sotto la Licenza GNU General Public License v3.0 - vedi il file [LICENSE](./LICENSE) per i dettagli.


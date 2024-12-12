import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { ExamService } from './exam.service';
import { QuestionService } from './question.service';

@Injectable({
  providedIn: 'root',
})

// servizio per aggiungere e manipolare i documenti in Firestore e per ascoltarne i cambiamenti
export class FirebaseService {

  constructor(
    private userService: UserService,
    private examService: ExamService,
    private questionService: QuestionService
  ) {}

  getUserService() {
    return this.userService;
  }

  getExamService() {
    return this.examService;
  }

  getQuestionService() {
    return this.questionService;
  }
}

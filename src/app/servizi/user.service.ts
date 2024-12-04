import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth = getAuth();
  private currentUser: User | null = null;
  private userData: any = null;
  private userSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private firebaseService: FirebaseService, private authService: AuthService) {
    this.listenToAuthChanges();
  }

  private listenToAuthChanges(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserData(user.uid);
      } else {
        this.userData = null;
        this.userSubject.next(null);
      }
    });
  }

  private async loadUserData(uid: string): Promise<void> {
    const ruolo = this.currentUser?.email?.includes('docente') ? 'docente' : 'studente';
    try {
      const userData = await this.firebaseService.getUserData(uid, ruolo);
      this.userData = userData;
      this.userSubject.next(userData); // Emit updated data to observers
    } catch (error) {
      console.log('Error fetching user data', error);
    }
  }

  getUser(): any {
    return this.userData;
  }

  getUserObservable() {
    return this.userSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUserUID(): string | null {
  return this.currentUser ? this.currentUser.uid : null;
}

  getUserRole(): string {
    return this.currentUser?.email?.includes('docente') ? 'docente' : 'studente';
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.userData = null;
      this.userSubject.next(null);
    } catch (error) {
      console.error('Error during logout', error);
    }
  }

  // Utility functions to handle user-specific actions
  async updateUserField(field: string, value: any): Promise<void> {
    if (!this.currentUser) return;
    const uid = this.currentUser.uid;
    const ruolo = this.getUserRole();
    await this.firebaseService.updateUserField(uid, ruolo, field, value);
    this.loadUserData(uid); // Reload user data after update
  }

}

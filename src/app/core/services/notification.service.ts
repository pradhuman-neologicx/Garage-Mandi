import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) {}

  Getnotification(sudentId: any) {
    return this.apiservice.get('notifications/' + sudentId + '/student');
  }
  deletenotification(sudentId: any) {
    return this.apiservice.delete('notifications/' + sudentId + '/student');
  }
}



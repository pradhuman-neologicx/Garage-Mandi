import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable } from "rxjs";
@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private approvalStageMessage = new BehaviorSubject('');
  currentApprovalStageMessage = this.approvalStageMessage.asObservable();
  sessionId!: string;
  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) {}

  GetCalendarDates(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('calendar/get-dates', body, headers);
  }

  GetCalendarGenrate(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('calendar/generate-calendar', body, headers);
  }

  MarkSundayAsHoliday(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'calendar/mark-sundays-as-holidays',
      body,
      headers
    );
  }

  UpdatHoliday(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('calendar/update-holiday', body, headers);
  }

  CreateHoliday(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'calendar/mark-single-date-as-holiday',
      body,
      headers
    );
  }

  RemoveHoliday(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('calendar/remove-holiday', body, headers);
  }

  GetStudentCalendarDates(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'student-attendance/get-students-attendance',
      body,
      headers
    );
  }
  GetStaffCalendarDates(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'student-attendance/get-employee-attendance',
      body,
      headers
    );
  }
}

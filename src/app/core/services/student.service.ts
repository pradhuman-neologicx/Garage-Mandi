import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class StudentService {
  
  private approvalStageMessage = new BehaviorSubject("");
  currentApprovalStageMessage = this.approvalStageMessage.asObservable();
  GetBatches: any;
  updateBatches: any;
  GetCourseType: any;

  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) { }
 


  GetStudeyMaterilApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('dispatch-units/student-dispatched-data', body, headers);
  }




  // test series student
  GetStudenttestApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('test-series/student/get-tests', body, headers);
  }


  ViewDetailTestApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('test-series/student/get-test-details', body, headers);
  }


  


 
}

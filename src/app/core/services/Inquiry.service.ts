import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable } from "rxjs";
@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private approvalStageMessage = new BehaviorSubject('');
  currentApprovalStageMessage = this.approvalStageMessage.asObservable();
  sessionId!: string;
  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) {}

  GetState() {
    return this.apiservice.get('locations/getStates');
  }

  GetCities(countryCode: any, stateCode: any) {
    return this.apiservice.get(
      'locations/getCities?countryCode=' +
        countryCode +
        '&stateCode=' +
        stateCode
    );
  }

  PostInquiry(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('walkIn/addDetails', body, headers);
  }

  DiscountFeeapi(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('walkIn/discretionaryDiscount', body, headers);
  }

  DiscountStudentFeeapi(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post(
      'onboarding/discretionaryDiscount',
      body,
      headers
    );
  }

  GetFeeDetails(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('masters/get-fee', body, headers);
  }

  Uploaddocuemt(formData: any) {
    const headers = { 'content-type': 'multipart/form-data' };
    return this.apiservice.postWithoutHeader('onboarding/student', formData);
  }

  // student on board
  getStudents() {
    return this.apiservice.get('onboarding/all');
  }

  gettransferstudentapi() {
    return this.apiservice.get('onboarding/transferred-students');
  }

  UpdateTransferDetailapi(studentId: string, Userid: String): Observable<any> {
    const body = {
      userId: Userid,
      studentId: [studentId],
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.apiservice.post('onboarding/transfer-student', body, headers);
  }

  getOnboardEnq() {
    return this.apiservice.get('walkIn/onboard/enquiries');
  }


  getOnboardEnqpagination(tableSize:any, page:any) {
    return this.apiservice.get('walkIn/onboard/enquiries?limit=' +tableSize+ "&page=" +page);
  }

  GetonboardtableSearch(tableSize:any, page:any,searchText:any)  {
    return this.apiservice.get('walkIn/onboard/enquiries?limit=' +tableSize+ "&page=" +page+ "&search="+searchText);
  }





  Getspecificstudent(StudentId: any) {
    return this.apiservice.get('walkIn/all/' + StudentId);
  }

  GetUpdatstudent(StudentId: any) {
    return this.apiservice.get('onboarding/student/' + StudentId);
  }

  //student-walkin//

  Getinquirytable() {
    return this.apiservice.get('walkIn/all');
  }

  
  Getinquirytablepagination(tableSize:any, page:any) {
    return this.apiservice.get('walkIn/all?limit=' +tableSize+ "&page=" +page);
  }


  GetinquirytableSearch(tableSize:any, page:any,searchText:any)  {
    return this.apiservice.get('walkIn/all?limit=' +tableSize+ "&page=" +page+ "&search="+searchText);
  }


  

  StudentOnboard(body: any) {
    const headers = { 'content-type': 'multipart/form-data' };
    return this.apiservice.postWithoutHeader('onboarding/student', body);
  }
  StudentOnboardUpdate(body: any) {
    const headers = { 'content-type': 'multipart/form-data' };
    return this.apiservice.putWithoutHeader('onboarding/update', body);
  }

  updateinquiryStatus(enquiryId: string, status: string,userId:String): Observable<any> {
    const body = {
      enquiryId: [enquiryId],
      status: status,
      userId:userId
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.apiservice.put('walkIn/updateStatus', body, headers);
  }
  updateenquiry(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.put('walkIn/updateDetails', body, headers);
  }

  getstudentspecific(id: any) {
    return this.apiservice.get('walkIn/all/' + id);
  }
  getcourseFeesComponent() {
    return this.apiservice.get('masters/fee-courses-components');
  }

  Bulkuploadinquiryapi(formData: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.postWithoutHeader(
      'imports/import-enquiries',
      formData
    );
  }
  GetStudentdetailtab(sessionId: any, studentid: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.get(
      'students/students/' + sessionId + '/' + studentid
    );
  }
  GetOnboardingInquiryReport(sessionId:any) {
    return this.apiservice.get(
      'onboarding/enquiry-onboarding-report/' + sessionId
    );
  }




  getStudentonboardpagination(tableSize:any, page:any) {
    return this.apiservice.get('onboarding/all?limit=' +tableSize+ "&page=" +page);
  }

  GetonboardedSearch(tableSize:any, page:any,searchText:any)  {
    return this.apiservice.get('onboarding/all?limit=' +tableSize+ "&page=" +page+ "&search="+searchText);
  }



  GettransferedSearch(tableSize:any, page:any,searchText:any)  {
    return this.apiservice.get('onboarding/transferred-students?limit=' +tableSize+ "&page=" +page+ "&search="+searchText);
  }



  gettransferstudentapipagination(tableSize:any, page:any) {
    return this.apiservice.get('onboarding/transferred-students?limit=' +tableSize+ "&page=" +page);
  }

  Bulkuplodwithcheck(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.put('walkIn/updateStatus', body, headers);
  }


  TransferedStudentcheck(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('onboarding/transfer-student', body, headers);
  }

  StudentUpdate(body: any,id:any) {
    const headers = { 'content-type': 'multipart/form-data' };
    return this.apiservice.putWithoutHeader('students/update-student/'+id, body);
  }


  GetInqHistoryAPI(id:any) {
    return this.apiservice.get("history/inquiry-history/"+id);
  }

  GetonboardedHistoryAPI(id:any) {
    return this.apiservice.get("history/student-history/"+id);
  }


  Getinquiryhistory() {
    return this.apiservice.get('history/get-inquiries');
  }


  Getinquiryhistorypagination(tableSize:any, page:any) {
    return this.apiservice.get('history/get-inquiries?limit=' +tableSize+ "&page=" +page);
  }

  GetinquiryhistorySearch(tableSize:any, page:any,searchText:any)  {
    return this.apiservice.get('history/get-inquiries?limit=' +tableSize+ "&page=" +page+ "&search="+searchText);
  }




  getStudentonboardhistorypagination(tableSize:any, page:any) {
    return this.apiservice.get('history/get-onboardings?limit=' +tableSize+ "&page=" +page);
  }

  GetHistoryonboardedSearch(tableSize:any, page:any,searchText:any)  {
    return this.apiservice.get('history/get-onboardings?limit=' +tableSize+ "&page=" +page+ "&search="+searchText);
  }


  gethistoryStudents() {
    return this.apiservice.get('history/get-onboardings');
  }


  getInquiryHistoryDatewise(tableSize:any, page:any,searchText:any,from:any,to:any,userId: any,) {
    
    let url = 'history/get-inquiries?limit=' +tableSize+ "&page=" +page;
   
    if(searchText!=undefined){
      if(searchText.length>0){
      url = url + '&search=' + searchText;
    }
  }

    if(userId!=undefined){
      url = url + '&userId=' + userId;
    }
   
    if (from != undefined && to == undefined) {
       url = url + '&from=' + from;
 
    } else if (to != undefined && from == undefined) {
   
      url = url + '&to=' + to;
    } else if (to != undefined && from != undefined) {
 
     //  url = url + '?from=' + from+'&to='+to;
      if (from.length > 0 && to.length <= 0) {
        url = url + '&from=' + from;
      } else if (to.length > 0 && from.length <= 0) {
        url = url + '&to=' + to;
      } else if (to.length > 0 && from.length > 0) {
        url = url + '&from=' + from + '&to=' + to;
      }
    }
 

    
 
 
    console.log(url);
     return this.apiservice.get(
      url
     );
   }


}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FeesManagementService {
  private approvalStageMessage = new BehaviorSubject('');
  currentApprovalStageMessage = this.approvalStageMessage.asObservable();

  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) {}

  GetCourses() {
    return this.apiservice.get('course/getCourseTypes');
  }

  GetCoursesName() {
    return this.apiservice.get('course/getCourseList');
  }

  GetClassName() {
    return this.apiservice.get('course/getClasses');
  }

  GetDeliveryList() {
    return this.apiservice.get('masters/getModeOfDelivery');
  }

  GetSpecificCourse(CourseId: any) {
    return this.apiservice.get('course/getCourse/' + CourseId);
  }

  Createfeesmanagement(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('fee-management/createFee', body, headers);
  }

  Updatefeesmanagement(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('fee-management/updateFee', body, headers);
  }

  getFees(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('fee-management/getFees', body, headers);
  }

  Getsession() {
    return this.apiservice.get('masters/getCurrentSessions');
  }

  UpdateFeeStatus(FeeId: string, isActive: boolean): Observable<any> {
    const body = {
      feeId: FeeId,
      isActive: isActive.toString(), // Convert boolean to string
    };
    const token = this.jwtService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.apiservice.post('fee-management/updateStatus', body, headers);
  }

  // Anushka Code for Other-fees-master//
  Getfees(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('fee-management/getOtherFee', body, headers);
  }

  updatefeesStatus(otherFeeId: string, isActive: boolean): Observable<any> {
    const body = {
      otherFeeId: otherFeeId,
      isActive: isActive,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.apiservice.post(
      'fee-management/updateOtherFeeStatus',
      body,
      headers
    );
  }
  Createotherfees(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('fee-management/createOtherFee', body, headers);
  }
  updateFee(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('fee-management/updateOtherFee', body, headers);
  }

  // anushka code for scholarships //

  Getscholarships(body: any) {
    return this.apiservice.postWithoutHeader(
      'scholarship/getScholarships',
      body
    );
  }
  GetscholarshipsType() {
    return this.apiservice.get('scholarship/getTypes');
  }
  UpdateScholarstatus(
    scholarshipId: string,
    isActive: boolean
  ): Observable<any> {
    const body = {
      scholarshipId: scholarshipId,
      isActive: isActive,
    };
    return this.apiservice.putWithoutHeader('scholarship/statusUpdate', body);
  }

  Getcategories() {
    return this.apiservice.get('scholarship/getCategories');
  }

  CreateScholar(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('scholarship/create', body, headers);
  }

  updateScholar(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.put('scholarship/update', body, headers);
  }

  GetInquityFeesDetail(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('masters/get-fee', body, headers);
  }

  GetAppliedDetailsApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'masters/get-applied-scholarship',
      body,
      headers
    );
  }

  GetAppliedStudentApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'payment/get-applied-scholarship',
      body,
      headers
    );
  }

  RemoveDiscretionaryApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'walkIn/removeDiscretionaryDiscount',
      body,
      headers
    );
  }

  RemoveDiscretionaryStudentApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'onboarding/removeDiscretionaryDiscount',
      body,
      headers
    );
  }

  GetStudentFeeDetails(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/get-fee', body, headers);
  }

  getOtherFee(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('fee-management/getOtherFee', body, headers);
  }
  getchangespaid(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/mark-installment-as-paid', body, headers);
  }
  paySingleFee(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/pay-fee', body, headers);
  }
  payInstallmentFee(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/pay-fee', body, headers);
  }
  getInstallmentFee(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/get-installments', body, headers);
  }

  Getfessstudentmanagement(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('payment/get-students', body, headers);
  }

  GetfessstudentmanagementByCourseId(body: any, courseId: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post(
      'payment/get-students?courseId=' + courseId,
      body,
      headers
    );
  }
  getfeesStudentmanagementByFilter(
    body: any,
    courseId: any,
    studentName: any,
    studentRollNumber: any,
    feesState: any,
    batchId: any
  ) {
    const headers = { 'content-type': 'application/json' };
    let url = 'payment/get-students';

    if (
      courseId !== undefined ||
      studentName !== undefined ||
      studentRollNumber !== undefined ||
      feesState !== undefined ||
      batchId !== undefined
    ) {
      url += '?';
      if (courseId !== undefined) {
        url += 'courseId=' + courseId;
        if (
          studentName !== undefined ||
          studentRollNumber !== undefined ||
          feesState !== undefined ||
          batchId !== undefined
        ) {
          url += '&';
        }
      }
      if (studentName !== undefined) url += 'studentName=' + studentName;
      if (studentRollNumber !== undefined) {
        if (
          studentName !== undefined ||
          feesState !== undefined ||
          batchId !== undefined
        ) {
          url += '&';
        }
        url += 'studentRollNumber=' + studentRollNumber;
      }
      if (feesState !== undefined) {
        if (
          studentName !== undefined ||
          studentRollNumber !== undefined ||
          batchId !== undefined
        ) {
          url += '&';
        }
        url += 'feesState=' + feesState;
      }
      if (batchId !== undefined) {
        if (
          studentName !== undefined ||
          studentRollNumber !== undefined ||
          feesState !== undefined
        ) {
          url += '&';
        }
        url += 'batchId=' + batchId;
      }
    }

    console.log(url);
    return this.apiservice.post(url, body, headers);
  }

  SubmitpayFees(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post(
      'payment/pay-single-installment',
      body,
      headers
    );
  }
  SubmitOtherFees(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/pay-other-fee', body, headers);
  }

  GetStudentFeeDetailsViewApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/getFeeData', body, headers);
  }

  getStudentFees(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/getOverallData', body, headers);
  }

  // get course component

  GetCoursesComponentApi() {
    return this.apiservice.get('masters/courses-components');
  }

  Getfessrefundmanagement(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('payment/get-refund-details', body, headers);
  }
  Getfessrefund(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('payment/refund', body, headers);
  }

  GetDailyTransaction(userId: any,sessionId:any,from:any,to:any) {
    
   let url = 'payment/daily-transactions/' + sessionId + '/' + userId;
   if (from != undefined && to == undefined) {
      url = url + '?fromDate=' + from;

   } else if (to != undefined && from == undefined) {
  
     url = url + '?toDate=' + to;
   } else if (to != undefined && from != undefined) {

    //  url = url + '?from=' + from+'&to='+to;
     if (from.length > 0 && to.length <= 0) {
       url = url + '?fromDate=' + from;
     } else if (to.length > 0 && from.length <= 0) {
       url = url + '?toDate=' + to;
     } else if (to.length > 0 && from.length > 0) {
       url = url + '?fromDate=' + from + '&toDate=' + to;
     }
   }



   console.log(url);
    return this.apiservice.get(
     url
    );
  }

  // fees collection after getting student details
  // GetStudentFeecollectiondetail(body: any) {
  //   const headers = new HttpHeaders().set('Content-Type', 'application/json');
  //   return this.apiservice.post('payment/get-fee', body, headers);
  // }



  GettestSeriesStudentapi(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('students/test-series-report', body, headers);
  }


  GetScholarshipApi(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('payment/discount-details', body, headers);
  }


  GetScholorshipRefund(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('payment/add-discount', body, headers);
  }





  getHistoryDatewise(tableSize:any, page:any,searchText:any,from:any,to:any,userId: any,) {
    
    let url = 'history/get-onboardings?limit=' +tableSize+ "&page=" +page;
   
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


 
   Getprintapi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('payment/receipt', body, headers);
  }
  

}

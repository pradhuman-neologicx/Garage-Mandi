import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class Testseries {
  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) {}

  GetCourses(sessionId: any) {
    return this.apiservice.get('test-series/get-courses/' + sessionId);
  }

  GetTestCourseApi(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('test-series/get-tests', body, headers);
  }

  GetSpecificcourse(body: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.apiservice.post('test-series/get-tests', body, headers);
  }

  GetSpecifictestApi(id: any) {
    return this.apiservice.get('test-series/tests/' + id);
  }

  GetTestDetailsBYIdApi(id: any) {
    return this.apiservice.get('test-series/tests/' + id);
  }

  //  GetTestDetailsBYIdApi() {
  //   return this.apiservice.get("test-series/tests/661cea8a9ff026ab1b251e23");
  //  }

  UploadSyallbusApi(formData: any, id: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.postWithoutHeader(
      `test-series/tests/${id}/syllabus`,
      formData
    );
  }

  UploadResultApi(formData: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.postWithoutHeader(
      'test-series/upload-result',
      formData
    );
  }

  TestCreatedpai(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post('test-series/add-test-date', body, headers);
  }

  GetLockResultApi(id: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.get(`test-series/tests/${id}/lock`);
  }
  GetTestReportApi(id: any) {
    return this.apiservice.get(`test-series/test-report/${id}`);
  }
  GetTestReportBAtchApi(id: any,batchId:any) {
    return this.apiservice.get(
      `test-series/test-report/${id}?studentBatchId=${batchId}`
    );
  }
}



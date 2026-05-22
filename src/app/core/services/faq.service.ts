import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class FaqService {
  private approvalStageMessage = new BehaviorSubject("");
  currentApprovalStageMessage = this.approvalStageMessage.asObservable();

  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService
  ) { }


  // Canidate get api

  CreateFaQ(formData: any, headers: any) {
    return this.apiservice.post("faq/create", formData, headers);
  }

  UpdateFaQ(formData: any, headers: any) {
    return this.apiservice.post("faq/update", formData, headers);
  }

  UpdateFaq(formData: any, headers: any) {
    return this.apiservice.post("employer/jobPostUpdation", formData, headers);
  }

  GetFaQ() {
    return this.apiservice.get("faq/get");
  }


  DeactiveFaq(FAQId: any) {
    return this.apiservice.get("faq/deactivate/" + FAQId);
  }

  ActiveFaq(FAQId: any) {
    return this.apiservice.get("faq/activate/" + FAQId);
  }


  // Inquiry

  GetInquiry() {
    return this.apiservice.get("getEnquiries?limit=0&page=1");
  }

  GetInquirySM(SMID:any) {
    return this.apiservice.get("assignedEnquiriesToM/"+SMID+"?limit=0&page=1");
  }

  CreateInquiry(formData: any, headers: any){
    return this.apiservice.post("postEnquiry", formData,headers);
  }
  SMViewEnquiry(body: any) {
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post("viewEnquiry", body, headers);
  }

  

}

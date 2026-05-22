import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor( private http: HttpClient,
    private apiservice: ApiService,
    private jwtService: JwtService,
    private router: Router) { }

    // Anushka Courses API //
    updateCourseStatus(courseId: string, isActive: boolean): Observable<any> {
      const body = {
        "courseId": courseId,
        "isActive": isActive
      };
      return this.apiservice.putWithoutHeader('course/updateStatus', body)
      .pipe(
        tap((error: any) => {
          console.log('Response received:', error);
       this.erromessagefunction(error)
  
        })
      
      );
    }

    updateCoursesDetails(body:any){
      const headers = { 'content-type': 'application/json' };
      return this.apiservice.put("course/updateCourse",body,headers)
      .pipe(
        tap((error: any) => {
          console.log('Response received:', error);
       this.erromessagefunction(error)
  
        })
      
      );
    }

    
  PostCourses(formData: any){
    const headers = { 'content-type': 'application/json' };
    return this.apiservice.post("course/createCourse", formData,headers)
    .pipe(
      tap((error: any) => {
        console.log('Response received:', error);
     this.erromessagefunction(error)

      })
    
    );
  }


createEmployee():  Observable<any>{
  return this.apiservice.post('course/createCourse',{},{})
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );

}




// Anushka Batches API //



// GetRollnumberApi(){
//   return this.apiservice.get("students/students-by-batch/6610d8561000e03bb7b96c4a");
// }



UpdateBatchestatus(batchId: string, isActive: boolean): Observable<any> {
  const body = {
    "batchId": batchId,
    "isActive": isActive
  };
  return this.apiservice.putWithoutHeader('batch/updateBatchStatus', body)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );

}
PostBatches(formData: any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("batch/createBatch", formData,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}

updateBatch(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.put("batch/updateBatch",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}

updatesessionStatus(sessionId: string, isActive: boolean): Observable<any> {
  const body = {
    "sessionId": sessionId,
    "isActive": isActive
  };
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.apiservice.post('sessions/updateStatus', body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
CreateSession(body: any){
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  return this.apiservice.post("sessions/createSession", body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
updateSession(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("sessions/updateSession",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}



Getbatchassign(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("batch/getAssignedBatch",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}


Getbatchesfloor(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("batch/getActiveNotAssignedBatch",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
Getassignuserfloor(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("batch/assignMultipleBatchToUser",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );

}
Unassignuserfloor(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("batch/unassignUserFromBatch",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
Singleassignuserfloor(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("batch/assignUserToBatch",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}

// api code for dispatch material //


Addunitspost(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("dispatch-units/add-units",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
UpdateAddunitspost(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("dispatch-units/update-units",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}


getDispatchedmaterial(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("dispatch-units/get-students",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}


CreateUnitsIds(body: any){
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  return this.apiservice.post("dispatch-units/units-by-course-subjects", body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
dispatchstudents(body: any){
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  return this.apiservice.post("dispatch-units/dispatch-material", body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
Viewtabledispatchstudents(body: any){
  const headers = new HttpHeaders().set('Content-Type', 'application/json');
  return this.apiservice.post("dispatch-units/dispatched-data", body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}

createtest(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("test-series/create-test",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}
updatetest(body:any,testId:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.put("test-series/update-test/"+testId,body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}


getCourseNameid(body:any){
  const headers = { 'content-type': 'application/json' };
  return this.apiservice.post("masters/course-components-for-refund",body,headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
      if (
        error.status === 422 &&
        error.message &&
        (
          error.message.includes('The selected user id is invalid') ||
          error.message.includes('Your account has been deactivated') ||
          error.message.includes('Your token has been expired') ||
          error.message.includes('Your token has been expired. Please login again.')
        )
      ) {
        // Log the user out and navigate to sign-in page
        this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
        this.router.navigate(['/sign_in']); // Navigate to home route
        alert(error.message); // Show alert with error message
      } else if (error && error.message) {
        // Display error message
        alert(error.message);
      } 
    })
  
  );
}






GetpartytableApi(party_type:any,payment_type:any,search:any) {
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'

  });
  var url = "parties";
  if (party_type != undefined) {
    if (party_type.length>0) {
      url = `${url}?party_type=${party_type}`;
    } else {
      url = `${url}?party_type=4`;
    }
  } else {
    url = `${url}?party_type=4`;
  }
  if (payment_type != undefined) {
    if (payment_type.length>0) {
      url = `${url}&payment_type=${payment_type}`
    } else {
      url = `${url}&payment_type=all`;
    }
  } else {
    url = `${url}&payment_type=all`;
  }
  if (search != undefined)
  if (search.length>0) {
    url = `${url}&search=${search}`;
  }
 
  return this.apiservice.get(url,headers);
}
GetpartyTypetableApi() {
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.apiservice.get("party-types",headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}




createPartyApi(body:any,): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.apiservice.post(`parties`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}

UpdatePartyApi(body:any,): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.apiservice.post(`edit-party-data`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}




erromessagefunction(error: any)  {
  console.log('Response received:', error);
  var response = error  
 var errorMessage 
  if (typeof response.message === 'object' && response.message !== null && !Array.isArray(response.message)) {
    errorMessage = JSON.stringify(response.message);
  } else {
    errorMessage = response.message;
  }
  console.log(response);
  if (
    error.status === 422 &&
    error.message &&
    (
      errorMessage.includes('The selected user id is invalid') ||
      errorMessage.includes('Your account has been deactivated') ||
      errorMessage.includes('Your token has been expired') ||
      errorMessage.includes('Your token has been expired. Please login again.')
    )
  ) {
    // Log the user out and navigate to sign-in page
    this.jwtService.clearStorage(); // Clear token (implement this method in your JwtService)
    this.router.navigate(['/sign_in']); // Navigate to home route
    alert(errorMessage); // Show alert with error message
  } else if (error && error.message) {
    // Display error message
    alert(errorMessage);
  } 
}



getPartyByIdAPI(PartyId:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const body = {
    "party_id":PartyId,
    "user_id": user,
  };

  return this.apiservice.post(`get-party-data`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}




// Attendnace  api integration  **********************************************************************/




// getAttendacneAPI(projectId:any,userId:any,date:any,search:any,partytype:any): Observable<any> {
//   const user = this.jwtService.getpanelUserId();
//   const token = this.jwtService.getToken();
//   const headers = new HttpHeaders({
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   });
//   const body = {
//     "project_id":projectId,
//     "user_id": userId,
//     "date":date,
//     'party_type':partytype,
//     'search':search,
//     // ...(partytype ? { 'party_type': partytype } : {'party_type': 'all'}),
//     // ...(search ? { 'search': search } : {'search': ''}),
//     // 'search':search
//   };

//   return this.apiservice.post(`attendance`, body,  headers );
// }


// getattendace(project_id: any,date:any, partytype:any,search:any): Observable<any> {
//   const user = this.jwtService.getpanelUserId();
//   const token = this.jwtService.getToken();
//   const headers = new HttpHeaders({
//     'Authorization': `Bearer ${token}`,
//     'Content-Type': 'application/json'
//   });

//   const body = {
//     'user_id': user,
//     'project_id': project_id,
//     "date":date,
//     "search":search!=undefined?search:"",
//     ...(partytype ? { 'party_type': partytype } : {}),
//     // 'transaction_type': transaction_type,

//   };

//   return this.apiservice.post(`attendance`, body,  headers );
// }

GetStaffApi(projectId:any,staff:any,): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const body = {
    "project_id":projectId,
    "type": staff,
  };

  return this.apiservice.post(`get-parties-by-type`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}


CreateWorkforceApi(body:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
;

  return this.apiservice.post(`create-workforce`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}




CreateWorkerapi(body:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
;

  return this.apiservice.post(`add-party-workforce`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}



GetStafflabourcontractorapi(partyid:any,projectId:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const body = {
    "party_id":partyid,
    "project_id": projectId,
  };

  return this.apiservice.post(`get-workforce`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}







MarkAttendacneapi(body:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  

  return this.apiservice.post(`mark-attendance`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}


// update labour contractor


UpdateLabourContratorAPI(body:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,

  });
  

  return this.apiservice.post(`update-attendance`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}


getUpdateattendanceApi(ProjecId:any,userId:any,partyId:any,workforceid:any,date:any,type:any): Observable<any> {
  const user = this.jwtService.getpanelUserId();
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  var body
  if(type==2){
    body = {
      "project_id":ProjecId,
      "user_id": userId,
      "party_id":partyId,
  
      "workforce_id":workforceid,
      "date":date
    };
  } else {
    body = {
      "project_id":ProjecId,
      "user_id": userId,
      "party_id":partyId,
  
      "date":date
    };
  }


  return this.apiservice.post(`edit-attendance`, body,  headers )
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  
  );
}





getShiftApi() {
  const token = this.jwtService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.apiservice.get("shifts",headers)
  .pipe(
    tap((error: any) => {
      console.log('Response received:', error);
   this.erromessagefunction(error)

    })
  
  );
}




















































































}



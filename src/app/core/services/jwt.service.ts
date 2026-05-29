import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private http: HttpClient) { }

  // admin panel

  getisLoggedIn(): boolean {
    return window.localStorage['garage_mandi_isloggedIn'];
  }
  isLoggedIn(isloggedIn: boolean) {
    window.localStorage['garage_mandi_isloggedIn'] =
      isloggedIn != undefined ? isloggedIn : false;
  }

  getLoginAs(): number {
    return window.localStorage['garage_mandi_LoginAs'];
  }

  saveLoginAs(LoginAs: number) {
    window.localStorage['garage_mandi_LoginAs'] = LoginAs;
  }

  saveRoles(roles: any) {
    localStorage.setItem('garage_mandi_roles', JSON.stringify(roles));
  }

  getRoles() {
    return JSON.parse(localStorage.getItem('garage_mandi_roles') || '[]');
  }

  getfirstLoggedIn(): boolean {
    return window.localStorage['garage_mandi_isfirstlogin'];
  }
  firstLoggedIn(isfirstlogin: boolean) {
    window.localStorage['garage_mandi_isfirstlogin'] =
      isfirstlogin != undefined ? isfirstlogin : false;
  }

  getSession(): string {
    return window.localStorage['garage_mandi_Session'];
  }

  saveSession(Session: string) {
    window.localStorage['garage_mandi_Session'] = Session;
  }
  getName(): string {
    return window.localStorage['garage_mandi_name'];
  }

  saveName(name: string) {
    window.localStorage['garage_mandi_name'] = name;
  }

  getSessionStartdate(): string {
    return window.localStorage['garage_mandi_Sessionstartdate'];
  }

  saveSessionStartdate(Session: string) {
    window.localStorage['garage_mandi_Sessionstartdate'] = Session;
  }

  getSessionEnddate(): string {
    return window.localStorage['garage_mandi_SessionEnddate'];
  }

  saveSessionEnddate(Session: string) {
    window.localStorage['garage_mandi_SessionEnddate'] = Session;
  }

  getpanelUserId(): Number {
    return window.localStorage['garage_mandi_panel_user_id'];
  }

  savepanelUserId(userid: any) {
    window.localStorage['garage_mandi_panel_user_id'] = userid;
  }
  getadminame(): String {
    return window.localStorage['garage_mandi_adminname'];
  }

  saveadminame(adminname: string) {
    window.localStorage['garage_mandi_adminname'] = adminname;
  }

  saveAdminToken(Token: String) {
    window.localStorage['garage_mandi_Token'] = Token;
  }
  saveAdminRole(Role: String) {
    window.localStorage['garage_mandi_Role'] = Role;
  }
  getadmiRole(): String {
    return window.localStorage['garage_mandi_Role'];
  }
  getpanelPartyId(): Number {
    return window.localStorage['garage_mandi_Party_id'];
  }

  savePartyId(Party_id: Number) {
    window.localStorage['garage_mandi_Party_id'] = Party_id;
  }

  getType(): String {
    return window.localStorage['garage_mandi_Type'];
  }

  saveType(Type: String) {
    window.localStorage['garage_mandi_Type'] = Type;
  }

  getToken(): String {
    return window.localStorage['garage_mandi_Token'];
  }

  saveToken(Token: String) {
    window.localStorage['garage_mandi_Token'] = Token;
  }

  // Profile Image of
  getImageUrl(): String {
    return window.localStorage['garage_mandi_ImageUrl'];
  }

  saveImageUrl(ImageUrl: String) {
    window.localStorage['garage_mandi_ImageUrl'] = ImageUrl;
  }

  getUserId(): String {
    return window.localStorage['garage_mandi_user_id'];
  }

  saveUserId(user_id: String) {
    window.localStorage['garage_mandi_user_id'] = user_id;
  }

  ///call on logout
  clearStorage() {
    window.localStorage.removeItem('garage_mandi_isloggedIn');
    window.localStorage.removeItem('garage_mandi_panel_user_id');

    window.localStorage.removeItem('garage_mandi_Token');
    window.localStorage.removeItem('garage_mandi_Role');
    window.localStorage.removeItem('garage_mandi_adminname');
    window.localStorage.removeItem('garage_mandi_isfirstlogin');

    // window.localStorage.removeItem("isloggedStudent");
  }
}

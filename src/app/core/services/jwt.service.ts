import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private http: HttpClient) {}

  // admin panel

  getisLoggedIn(): boolean {
    return window.localStorage['cargo_isloggedIn'];
  }
  isLoggedIn(isloggedIn: boolean) {
    window.localStorage['cargo_isloggedIn'] =
      isloggedIn != undefined ? isloggedIn : false;
  }

  getLoginAs(): number {
    return window.localStorage['cargo_LoginAs'];
  }

  saveLoginAs(LoginAs: number) {
    window.localStorage['cargo_LoginAs'] = LoginAs;
  }

  saveRoles(roles: any) {
    localStorage.setItem('cargo_roles', JSON.stringify(roles));
  }

  getRoles() {
    return JSON.parse(localStorage.getItem('cargo_roles') || '[]');
  }

  getfirstLoggedIn(): boolean {
    return window.localStorage['cargo_isfirstlogin'];
  }
  firstLoggedIn(isfirstlogin: boolean) {
    window.localStorage['cargo_isfirstlogin'] =
      isfirstlogin != undefined ? isfirstlogin : false;
  }

  getSession(): string {
    return window.localStorage['cargo_Session'];
  }

  saveSession(Session: string) {
    window.localStorage['cargo_Session'] = Session;
  }
  getName(): string {
    return window.localStorage['cargo_name'];
  }

  saveName(name: string) {
    window.localStorage['cargo_name'] = name;
  }

  getSessionStartdate(): string {
    return window.localStorage['cargo_Sessionstartdate'];
  }

  saveSessionStartdate(Session: string) {
    window.localStorage['cargo_Sessionstartdate'] = Session;
  }

  getSessionEnddate(): string {
    return window.localStorage['cargo_SessionEnddate'];
  }

  saveSessionEnddate(Session: string) {
    window.localStorage['cargo_SessionEnddate'] = Session;
  }

  getpanelUserId(): Number {
    return window.localStorage['cargo_panel_user_id'];
  }

  savepanelUserId(userid: any) {
    window.localStorage['cargo_panel_user_id'] = userid;
  }
  getadminame(): String {
    return window.localStorage['cargo_adminname'];
  }

  saveadminame(adminname: string) {
    window.localStorage['cargo_adminname'] = adminname;
  }

  saveAdminToken(Token: String) {
    window.localStorage['cargo_Token'] = Token;
  }
  saveAdminRole(Role: String) {
    window.localStorage['cargo_Role'] = Role;
  }
  getadmiRole(): String {
    return window.localStorage['cargo_Role'];
  }
  getpanelPartyId(): Number {
    return window.localStorage['cargo_Party_id'];
  }

  savePartyId(Party_id: Number) {
    window.localStorage['cargo_Party_id'] = Party_id;
  }

  getType(): String {
    return window.localStorage['cargo_Type'];
  }

  saveType(Type: String) {
    window.localStorage['cargo_Type'] = Type;
  }

  getToken(): String {
    return window.localStorage['cargo_Token'];
  }

  saveToken(Token: String) {
    window.localStorage['cargo_Token'] = Token;
  }

  // Profile Image of
  getImageUrl(): String {
    return window.localStorage['cargo_ImageUrl'];
  }

  saveImageUrl(ImageUrl: String) {
    window.localStorage['cargo_ImageUrl'] = ImageUrl;
  }

  getUserId(): String {
    return window.localStorage['cargo_user_id'];
  }

  saveUserId(user_id: String) {
    window.localStorage['cargo_user_id'] = user_id;
  }

  ///call on logout
  clearStorage() {
    window.localStorage.removeItem('cargo_isloggedIn');
    window.localStorage.removeItem('cargo_panel_user_id');

    window.localStorage.removeItem('cargo_Token');
    window.localStorage.removeItem('cargo_Role');
    window.localStorage.removeItem('cargo_adminname');
    window.localStorage.removeItem('cargo_isfirstlogin');

    // window.localStorage.removeItem("isloggedStudent");
  }
}

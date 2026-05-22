import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  PRIMARY_OUTLET,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { JwtService } from "../services/jwt.service";

@Injectable()
export class DirectAccessGuard implements CanActivate {
  constructor(private router: Router, private jwtService: JwtService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const pageAccessedByReload =
      (window.performance.navigation &&
        window.performance.navigation.type === 1) ||
      window.performance
        .getEntriesByType("navigation")
        .map((nav: any) => nav.type)
        .includes("reload");
    console.log(pageAccessedByReload);
    if (pageAccessedByReload == true) {
      return true;
    } else {
      if (this.router.url === "/") {
        console.log(this.router);
        var loginAs=this.jwtService.getLoginAs();
        if(loginAs!=undefined){
          this.router.navigate(["/sign_in"]); //Navigate away to signIn page
        }else{
          this.router.navigate(["/dashboard"]); //Navigate away to signIn page
        }
       
        return false;
      }
    }

    return true;
  }
}

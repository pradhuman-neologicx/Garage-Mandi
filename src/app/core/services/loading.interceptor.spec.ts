import { HttpEvent, HttpHandler, HttpRequest } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { LoadingInterceptor } from "./loading.interceptor";
import { LoaderService } from "./loader.service";

describe("LoadingInterceptor", () => {
  let interceptor: LoadingInterceptor;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj("LoaderService", ["setLoading"]);
    TestBed.configureTestingModule({
      providers: [
        LoadingInterceptor,
        { provide: LoaderService, useValue: loaderSpy },
      ],
    });
    interceptor = TestBed.inject(LoadingInterceptor);
    loaderServiceSpy = TestBed.inject(
      LoaderService
    ) as jasmine.SpyObj<LoaderService>;
  });

  it("should be created", () => {
    expect(interceptor).toBeTruthy();
  });

  it("should increase the request count and set loading to true when a request is made", () => {
    const httpRequest = new HttpRequest("GET", "https://www.google.com");
    const httpHandler = {
      handle: (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
        return of();
      },
    } as HttpHandler;
    interceptor.intercept(httpRequest, httpHandler);
    expect(loaderServiceSpy.setLoading).toHaveBeenCalledWith(true);
    expect(interceptor["totalRequests"]).toEqual(1);
  });

  it("should decrease the request count and set loading to false when all requests are completed", () => {
    const httpRequest = new HttpRequest("GET", "https://www.google.com");
    const httpHandler = {
      handle: (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
        return of();
      },
    } as HttpHandler;
    interceptor.intercept(httpRequest, httpHandler);
    interceptor.intercept(httpRequest, httpHandler);
    interceptor.intercept(httpRequest, httpHandler);
    interceptor.intercept(httpRequest, httpHandler);
    expect(loaderServiceSpy.setLoading).toHaveBeenCalledWith(true);
    expect(interceptor["totalRequests"]).toEqual(4);
    interceptor.intercept(httpRequest, httpHandler);
    expect(loaderServiceSpy.setLoading).toHaveBeenCalledWith(true);
    expect(interceptor["totalRequests"]).toEqual(5);
  });
});

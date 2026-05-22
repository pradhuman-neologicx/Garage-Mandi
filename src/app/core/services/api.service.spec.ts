import { TestBed, inject } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { ApiService } from "./api.service";
import { JwtService } from "./jwt.service";
import { environment } from "src/environments/environment";

describe("ApiService", () => {
  let apiService: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, JwtService],
    });

    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(apiService).toBeTruthy();
  });

  describe("get()", () => {
    it("should make a GET request and return data", () => {
      const dummyData = { name: "John Doe" };
      apiService.get("users").subscribe((data) => {
        expect(data).toEqual(dummyData);
      });

      const req = httpMock.expectOne(`${environment.api_url}users`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyData);
    });

    it("should handle errors", () => {
      const errorMessage = "404 Not Found";
      apiService.get("users").subscribe(
        () => {},
        (error) => {
          expect(error).toEqual(errorMessage);
        }
      );

      const req = httpMock.expectOne(`${environment.api_url}users`);
      expect(req.request.method).toBe("GET");
      req.flush(errorMessage, { status: 404, statusText: "Not Found" });
    });
  });

  describe("post()", () => {
    it("should make a POST request and return data", () => {
      const dummyData = { };
      const dummyHeader = { Authorization: "Bearer TOKEN" };
      apiService
        .post("employmenttypes", dummyData, dummyHeader)
        .subscribe((data) => {
          expect(data).toEqual(dummyData);
        });

      const req = httpMock.expectOne(`${environment.api_url}employmenttypes`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(dummyData);
      expect(req.request.headers.get("Authorization")).toBe("Bearer TOKEN");
      req.flush(dummyData);
    });
  });
  
});
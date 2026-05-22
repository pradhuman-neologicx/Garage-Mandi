import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ApiService } from "./api.service";
import { DataService } from "./data.service";
import { JwtService } from "./jwt.service";

describe("DataService", () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, ApiService, JwtService, DataService],
    });
    service = TestBed.inject(DataService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
    it("should update the current message correctly", () => {
      const message = '';
      service.currentMessage.subscribe((updatedMessage) => {
        expect(updatedMessage).toEqual(message);
      });
      service.changeMessage(message);
    });
});

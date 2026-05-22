import { TestBed } from "@angular/core/testing";
import { LoaderService } from "./loader.service";

describe("LoaderService", () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoaderService],
    });
    service = TestBed.inject(LoaderService);
  });

  it("should set loading to true", () => {
    service.setLoading(true);
    expect(service.getLoading()).toEqual(true);
  });

  it("should set loading to false", () => {
    service.setLoading(false);
    expect(service.getLoading()).toEqual(false);
  });
});

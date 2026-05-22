export class courses {
  name!: string
  courseTypeId!: string
  courseCode!: string
  classId!: string
  courseId!: string
  subjectsIds!: string;
}


export class Batches {
  batchId!: string
  batchCode!: any
  courseId!: string
  medium!: string
  shiftId!: string
  deliveryModeId!: string
  sessionId!: string
  startDate!: string
  studentInstallments: any;

}
export class batchmodel {
  installmentNumber!: number
  date!: number
}

export class CreateSession {
  sessionId!: string;
  name!: string;
  startDate!: string;
  endDate!: string;
}

export class assignBatches {
  userId!: string;
  batchIds!: any;
  batchId!: any;
}

export class mapBatchesandclass {

  batchId!: any;
  classroomId!: any;
}

export class Unitsadd {
    // unitId!:string;
    sessionId!: string;
    courseId!:string;
    subjectId!: string;
    units!:any;
    newUnits:any;
}

export class unitsmodel {
  unitNumber!: any;
  name!: any;

}
export class coursebatchesids {
  courseId:any;
  batches:any;

}
export class dispatch {
  sessionId!: string;
  courseId!: string;
  studentIds: string[] = [];
  subjectId!: string;
  unitIds!: string;
  dispatchDate: any;
  userId!:string;
  description:any;

}
export class testseriess {
  sessionId!: string;
  courseId!: string;
  testType!: string;
  subjectType!:string;
  patternName! :string;
  subjects:any;
  testSeriesCount: any;
}
export class testseriesmodel {
  subjectId!: string;
  maxMarks: any;
  subjectNumber: any;
}
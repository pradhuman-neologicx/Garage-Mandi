export class Employee {
  name!: string;
  email!: string;
  mobileNumber!: string;
  role!: string;
  password!: string;
  image!: string;
}

export class updatePassord {
  userId!: string;
  newPassword!: string;
  confirmPassword!: string;
}
export class studentupdatePassord {
  studentRollNumber!: string;
  password!: string;
  confirmPassword!: string;
}

export class studentupdateBatch {
  studentId!: string;
  courseId!: string;
  newBatchId!: string;
  sessionId!: string;
  userId!: string;
}

export class projects {
  name!: string;
  start_date!: any;
  end_date!: any;
  description!: string;
  state_id!: any;
  city_id!: any;
  address!: string;
  user_id!: any;
  assign_to_id: any;
  party_id: any;
}

export class units {
  name!: string;
  email!: any;
  number!: any;
  unit_id!: string;
}
export class material {
  name!: string;
  unit_id!: string;
  material_id!: string;
  description!: string;
}

export class CreateFee {
  sessionId!: string;
  courseId!: string;
  fees: any;
  gst!: number;

  firstInstallment!: number;
  secondInstallment!: number;
  thirdInstallment!: number;
}



export class UpdateFee {
  feeId!: string;
  sessionId!: string;
  courseId!: string;
  fees: any;
  gst!: number;

}
export class createotherFees {
  sessionId!: string;
  feeType!: string;
  amount!: any;
  otherFeeId!: string;
}

export class createScholarship {
  scholarshipTypeId!: string;
  scholarshipId!: string;
  name!: string;
  shortName!: string;
  description!: string;
  category!: string;
  applicableFor!: string;
  percentageSlabType!: string;
  percentageOff!: string;
  slabs!: any;
  sessionId!: string;
  courseId!: any;
  continuingStudents!: any;
}
export class slabs {
  year!: string;
  min!: number;
  max!: number;
  percentageOff!: string;
}


export class inquiryDetails {
  enquiryId!: string;
  firstName!: string;
  middleName!: string;
  lastName!: string;
  userId!: String;
  fullName!: string;
  fatherName!: string;
  fatherMobile!: string;
  fatherWhatsappMobileNo!: string;
  mobileNumber!: string;
  status!: string;
  whatsappNumber!: string;
  categoryId!: string;
  state!: string;
  city!: string;
  address!: string;
  speciallyAbledPerson!: boolean;
  belongToEws!: boolean;
  isBgExService!: boolean;
  course!: any;
  foundationBatchRepeater!: boolean;
  repeaterYears!: number;
  hasGivenScholarshipTest!: boolean;
  scholarshipTests!: any;

  hasGivenCompetitionExam!: boolean;
  competitionExamDetails!: any;

  previousBoardClassPercentage!: number;
}
export class scholarshipTestsModel {
  year!: number;
  percentage!: number;
}
export class courseModel {
  sessionId!: string;
  courseId!: string;
  modeOfDeliveryId!: string;
  board!: string;
  medium!: string;
  // courseContent!: any // 0 : Study Material, 1 : Test Series, 2 : Tution, 3 : Online, 4: Recorded 
  courseComponentId!:string;
}
export class competitionExamDetailsModel {
  exam!: string;
  year!: number;
  percentage!: number;
  rank!: number;
  categoryRank!: number;
}

export class payFeeModel {
  installmentNumber!: string; //in single only
  sessionId!: string;
  studentId!: string;
  userId!: string;
  date!: string;
  studentRollNumber!: string;
  amount!:number;
  // We are going to calculate the amount by ourselves
  depositInSingleInstallment!: boolean;
  paymentMethod!: string;
  transactionNo!: any; // required if the transaction is happening through 'DD' or 'Check'
  paymentDetails!: any;
  otherFees!: any;
}


export class payfessSumbitModel {
  installmentNumber!: any;
  sessionId!: string;
  studentId!: string;
  userId!: string;
  paymentMethod!: string;
  transactionNo!: any; // required if the transaction is happening through 'DD' or 'Check
  date!: string;
  otherFees!: any;
  paymentDetails!: any;
  amount!:any;
}


export class Discountfee {
  enquiryId!: string;
  sessionId!: string;
  discountPercentage!: string;
  reasonForDiscount!: string;
}


export class DiscountfeeStudent {
  studentId!: string;
  sessionId!: string;
  discountPercentage!: string;
  reasonForDiscount!: string;
}
export class Refund {
  sessionId!: string;
  studentId!: string;
  refundType!: any;
  paymentMethod!: any;
  courseComponentId!: any;
  refundDate!: any;
  paymentType!: any;
  transactionNumber!: any;
  reasonForRefund!: any;
}


export class Scholorshiprefund {
  sessionId!: string;
  studentId!: string;
  userId!: any;
  discountPercentage!: any;
  reasonForDiscount!: any;
  refundableAmount!: any;
  reasonForRefund!: any;
  transactionNumber!: any;
}


// export class RefundModel {
//   sessionId !: string;
//   studentId !: string;
//   refundType!: string;
//   refundStatus!: string;
//   payableAmount!: number;
//   depositInSingleInstallment!: boolean;
//   courseComponentId!: string;
//   discountPercentage!: number;
//   userId!: string;
//   amount!: number;
//   date!: string;
//   paymentMethod!: string;
//   name!: string;
//   transactionNumber!: string;
//   reasonForRefund!: string;
// }


// // "installments": [
// //   {
// //       "installmentNumber": "Installment 1",
// //       "amount": 9440
// //   }
// // ],


export class Installment {
  installmentNumber!: string;
  amount!: number;
}

export class RefundModel {
  sessionId!: string;
  studentId!: string;
  refundType!: string;
  refundStatus!: string;
  refundableAmount!:number;
  payableAmount!: number;
  depositInSingleInstallment!: boolean;
  courseComponentId!: string;
  discountPercentage!: number;
  userId!: string;
  amount!: number;
  date!: string;
  paymentMethod!: string;
  name!: string;
  transactionNumber!: string;
  reasonForRefund!: string;
  installments!: Installment[]; // Added property for installments
}


export class paydate {
  date!: string;
  sessionId!: string;
  studentId!: string;
  userId!: string;
  installmentNumber!: any;
}
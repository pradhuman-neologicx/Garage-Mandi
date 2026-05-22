
export class Createparty {
    name!: string
    type_id!: number
    email!: string
    mobile!: string
    gst_details:any;
    bank_details:any;
    opening_balance:any;
    monthly_salary :any;
    }


    
export class Updateparty {
    party_id!:number
    user_id!:number
    name!: string
    type_id!: number
    email!: string
    is_active!:boolean
    mobile!: string
    gst_details:any;
    bank_details:any;
    opening_balance:any;
    monthly_salary :any;
    }
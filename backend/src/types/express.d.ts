interface AdditionalInfo {
	jwtProvided: boolean,
	jwtVerifyError: boolean,
	jwtExpired: boolean,
	jwtPayload: any
}
declare namespace Express {
	export interface Request {
		additionalInfo: AdditionalInfo
	}
}

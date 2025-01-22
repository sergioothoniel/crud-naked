export interface APIGatewayEvent {
  httpMethod: string
  path: string
  headers?: Record<string, string>
  queryStringParameters?: { [key: string]: string }
  body?: string | null
  pathParameters?: { [key: string]: string }
  requestContext?: {
    accountId: string
    apiId: string
    authorizer?: { [key: string]: any }
    httpMethod: string
    identity: {
      sourceIp: string
      userAgent: string
    }
    path: string
    stage: string
  }
}

export interface Request {
  path: string
  headers?: Record<string, string>
  method: string
  params?: Record<string, string>
  routeParams?: Record<string, string>
  body?: string | null
}

export interface Response {
  statusCode: number
  headers?: Record<string, string>
  body?: Record<string, string> | string
}

export interface IClient {
  fullName: string
  birthDate: string
  active?: true
  adressList: string[]
  contactList: {
    email: string
    phone: string
  }[]
  createdAt?: string
  updatedAt?: string
}

export interface IUpdateClient {
  fullName?: string
  birthDate?: string
  active?: true
  adressList?: string[]
  contactList?: {
    email: string
    phone: string
  }[]
}

type DynamoDBAttribute =
  | { S: string }
  | { N: string }
  | { BOOL: boolean }
  | { L: DynamoDBAttribute[] }
  | { M: { [key: string]: DynamoDBAttribute } }

export interface DynamoDBItem {
  contactList: { L: DynamoDBAttribute[] }
  active: { BOOL: boolean }
  birthDate: { S: string }
  updatedAt: { S: string }
  createdAt: { S: string }
  adressList?: { L: DynamoDBAttribute[] }
  fullName: { S: string }
  Id: { S: string }
}

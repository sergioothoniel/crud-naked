import { DynamoDBItem, IClient, IUpdateClient } from "../types"
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb"
import { createHash } from "crypto"

export class ClientServices {
  private DB: DynamoDBClient
  private tableName: string

  constructor() {
    this.DB = new DynamoDBClient()
    this.tableName = "Clients"
  }

  private generateHash(input: string) {
    const hash = createHash("sha256")
    hash.update(input)
    return hash.digest("hex")
  }

  private formatReadDynamoResponse(item: DynamoDBItem) {
    try {
      const {
        contactList,
        active,
        birthDate,
        updatedAt,
        createdAt,
        adressList,
        fullName,
        Id,
      } = item

      const resultContact = contactList.L?.map((contact: any) => {
        const { email, phone } = contact.M as {
          email: { S: string }
          phone: { S: string }
        }
        return {
          email: email.S,
          phone: phone.S,
        }
      })
      return {
        Id: Id.S,
        fullName: fullName.S,
        birthDate: birthDate.S,
        adressList: adressList && adressList.L?.map((adress: any) => adress.S),
        contactList: resultContact,
        active: active.BOOL,
        createdAt: createdAt.S,
        updatedAt: updatedAt.S,
      }
    } catch (error) {
      console.error(error)
      throw new Error("Não foi possível formatar resposta do DynamoDB")
    }
  }

  private formatToDynamoValue(value: any): any {
    if (typeof value === "string") return { S: value }
    if (typeof value === "boolean") return { BOOL: value }
    if (Array.isArray(value))
      return { L: value.map((v) => this.formatToDynamoValue(v)) }
    if (typeof value === "object" && value !== null) {
      const formattedMap: Record<string, any> = {}
      for (const key in value) {
        formattedMap[key] = this.formatToDynamoValue(value[key])
      }
      return { M: formattedMap }
    }
    return { S: String(value) }
  }

  async createClientService(clientData: IClient) {
    try {
      const idItem = this.generateHash(Date.now().toString())
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: {
          Id: this.formatToDynamoValue(idItem),
          fullName: this.formatToDynamoValue(clientData.fullName),
          birthDate: this.formatToDynamoValue(clientData.birthDate),
          active: this.formatToDynamoValue(true),
          adressList: this.formatToDynamoValue(clientData.adressList),
          contactList: this.formatToDynamoValue(clientData.contactList),
          createdAt: { S: new Date().toISOString() },
          updatedAt: { S: new Date().toISOString() },
        },
      })
      await this.DB.send(command)
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Usuário criado com sucesso",
          Id: idItem,
        }),
      }
    } catch (error: any) {
      console.log(error)
      throw new Error("Não foi possível inserir novo cliente")
    }
  }

  async listClientsService(limit = 25, startId?: string) {
    try {
      const params = {
        TableName: this.tableName,
        Limit: limit,
        ExclusiveStartKey: startId
          ? {
              Id: {
                S: startId,
              },
            }
          : undefined,
      }

      const command = new ScanCommand(params)
      const result = await this.DB.send(command)
      const items = result.Items
        ? result.Items.map((item) =>
            this.formatReadDynamoResponse(item as unknown as DynamoDBItem)
          )
        : []

      return {
        statusCode: 200,
        body: JSON.stringify({
          items,
          nextKey: result.LastEvaluatedKey || null,
        }),
      }
    } catch (error: any) {
      console.log(error)
      throw new Error("Não foi possível listar clientes")
    }
  }

  async getClientService(IdClient: string) {
    try {
      const params = {
        TableName: this.tableName,
        Key: {
          Id: { S: IdClient },
        },
      }
      const command = new GetItemCommand(params)
      const response = await this.DB.send(command)
      if (response.Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(
            this.formatReadDynamoResponse(
              response.Item as unknown as DynamoDBItem
            )
          ),
        }
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ errorMessage: "Not found" }),
        }
      }
    } catch (error) {
      console.log(error)
      throw new Error("Não foi possível recuperar cliente")
    }
  }

  async updateClientService(IdClient: string, updateData: IUpdateClient) {
    try {
      const params = {
        TableName: this.tableName,
        Key: {
          Id: { S: IdClient },
        },
      }
      const getCommand = new GetItemCommand(params)
      const response = await this.DB.send(getCommand)

      if (!response.Item)
        return {
          statusCode: 404,
          body: JSON.stringify({ errorMessage: "Not found" }),
        }

      let updateExpression = "SET"
      const expressionAttributeValues: Record<string, any> = {}
      const expressionAttributeNames: Record<string, string> = {}

      Object.keys(updateData).forEach((key, index) => {
        const attributeKey = `#attr${index}`
        const valueKey = `:val${index}`

        updateExpression += ` ${attributeKey} = ${valueKey},`
        expressionAttributeNames[attributeKey] = key
        expressionAttributeValues[valueKey] = this.formatToDynamoValue(
          updateData[key as keyof IUpdateClient]
        )
      })

      updateExpression = updateExpression.slice(0, -1)

      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: {
          Id: { S: IdClient },
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
      })

      await this.DB.send(command)

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Cliente atualizado com sucesso" }),
      }
    } catch (error) {
      console.log(error)
      throw new Error("Não foi possível atualizar dados do cliente")
    }
  }

  async deleteClientService(IdClient: string) {
    try {
      const params = {
        TableName: this.tableName,
        Key: {
          Id: { S: IdClient },
        },
      }
      const getCommand = new GetItemCommand(params)
      const response = await this.DB.send(getCommand)

      if (!response.Item)
        return {
          statusCode: 404,
          body: JSON.stringify({ errorMessage: "Not found" }),
        }

      const command = new DeleteItemCommand(params)
      await this.DB.send(command)

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Cliente deletado com sucesso" }),
      }
    } catch (error) {
      console.log(error)
      throw new Error("Não foi possível deletar cliente")
    }
  }
}

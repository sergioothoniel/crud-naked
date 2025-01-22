import { ClientServices } from "../services/client.service"
import { IClient, Request, Response } from "../types"

export class ClientController {
  private clientService: ClientServices

  constructor() {
    this.clientService = new ClientServices()
    this.createClientController = this.createClientController.bind(this)
    this.listClientsControlle = this.listClientsControlle.bind(this)
    this.getClientController = this.getClientController.bind(this)
    this.updateClientController = this.updateClientController.bind(this)
    this.deleteClientController = this.deleteClientController.bind(this)
  }

  async createClientController(req: Request, res: Response): Promise<Response> {
    try {
      const clientData = JSON.parse(req.body as string) as IClient

      const payloadClient: IClient = {
        fullName: clientData.fullName || "",
        birthDate: clientData.birthDate || "",
        adressList: clientData.adressList || [],
        contactList: clientData.contactList || [],
      }

      for (const key in payloadClient) {
        if (["fullName", "birthDate"].includes(key)) {
          if (
            !payloadClient[key as keyof IClient] ||
            typeof payloadClient[key as keyof IClient] !== "string"
          ) {
            throw new Error(`Parâmetro ${key} inválido`)
          }
        } else if (
          key === "adressList" &&
          payloadClient[key as keyof IClient] &&
          !Array.isArray(payloadClient[key as keyof IClient])
        ) {
          throw new Error(`Parâmetro ${key} deve ser uma lista`)
        } else if (key === "contactList") {
          if (
            !Array.isArray(payloadClient[key]) ||
            payloadClient[key].length === 0
          ) {
            throw new Error("Nenhum contato enviado")
          }

          const contactListFormatted = payloadClient.contactList.map(
            (contact) => {
              if (!(contact.email && contact.phone)) {
                throw new Error("Um dos contatos não contém email ou telefone")
              }
              return {
                email: contact.email,
                phone: contact.phone,
              }
            }
          )
          payloadClient.contactList = contactListFormatted
        }
      }

      return await this.clientService.createClientService(payloadClient)
    } catch (error: any) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errorMessage: error.message }),
      }
    }
  }

  async listClientsControlle(req: Request, res: Response) {
    try {
      const { limit, startId } = req.params as Record<string, string>
      return await this.clientService.listClientsService(Number(limit), startId)
    } catch (error: any) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errorMessage: error.message }),
      }
    }
  }

  async getClientController(req: Request, res: Response) {
    try {
      const { id } = req.routeParams as Record<string, string>
      if (!id) throw new Error("IdClient não enviado")

      return await this.clientService.getClientService(id)
    } catch (error: any) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errorMessage: error.message }),
      }
    }
  }

  async updateClientController(req: Request, res: Response) {
    try {
      const { id } = req.routeParams as Record<string, string>
      const body = req.body ? JSON.parse(req.body as string) : {}
      body.updatedAt = new Date().toISOString()

      if (!id) throw new Error("IdClient não enviado")

      return await this.clientService.updateClientService(id, body)
    } catch (error: any) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errorMessage: error.message }),
      }
    }
  }

  async deleteClientController(req: Request, res: Response) {
    try {
      const { id } = req.routeParams as Record<string, string>

      if (!id) throw new Error("IdClient não enviado")

      return await this.clientService.deleteClientService(id)
    } catch (error: any) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errorMessage: error.message }),
      }
    }
  }
}

import { ClientServices } from "../services/client.service"
import { strict as assert } from "assert"

class UnitTests {
  private clientService: ClientServices
  private clientIdTest: string

  constructor() {
    this.clientService = new ClientServices()
    this.clientIdTest = ""
  }

  async createClientTest() {
    const newItem = {
      fullName: "Nome Teste",
      birthDate: "15/05/1993",
      adressList: ["Avenida Brasil"],
      contactList: [
        {
          email: "email@email",
          phone: "2199999",
        },
      ],
    }
    const response = await this.clientService.createClientService(newItem)
    const body = JSON.parse(response.body)
    assert.equal(response.statusCode, 200, "Esperava statusCode 200")
    assert(body.message, "Esperava uma mensagem de confimação")
    assert(body.Id, "Esperava o Id do cliente inserido")
    this.clientIdTest = body.Id
    console.log("Teste de criação de cliente passou")
  }

  async listClientsTest() {
    const limit = 10
    const response = await this.clientService.listClientsService(limit)
    assert.equal(response.statusCode, 200, "Esperava statusCode 200")
    assert(
      Array.isArray(JSON.parse(response.body).items),
      "Resposta não é um array"
    )
    console.log("Teste de listagem de clientes passou")
  }

  async getClientTest() {
    const response = await this.clientService.getClientService(
      this.clientIdTest
    )
    assert.equal(response.statusCode, 200, "Esperava statusCode 200")
    const body = JSON.parse(response.body)
    assert(body.fullName, "Esperava parâmetro fullName ao recuperar cliente")
    assert(body.birthDate, "Esperava parâmetro fullName ao recuperar cliente")
    assert(body.active, "Esperava parâmetro fullName ao recuperar cliente")

    const idFake = "656419811898115156"
    const responseFakeClient = await this.clientService.getClientService(idFake)
    assert.equal(responseFakeClient.statusCode, 404, "Esperava statusCode 404")

    console.log("Teste de retorno de cliente passou")
  }

  async updateClientTest() {
    const updateParams = {
      adressList: ["Avenida Chile"],
      fullName: "Pessoa teste updated",
    }

    const response = await this.clientService.updateClientService(
      this.clientIdTest,
      updateParams
    )

    assert.equal(response.statusCode, 200, "Esperava statusCode 200")
    const body = JSON.parse(response.body)
    assert(body.message, "Esperava mensagem de confirmação de update")

    const idFake = "656419811898115156"
    const responseFakeClient = await this.clientService.updateClientService(
      idFake,
      updateParams
    )
    assert.equal(responseFakeClient.statusCode, 404, "Esperava statusCode 404")

    console.log("Teste de update de cliente passou")
  }

  async deleteClientTest() {
    const response = await this.clientService.deleteClientService(
      this.clientIdTest
    )

    assert.equal(response.statusCode, 200, "Esperava statusCode 200")
    const body = JSON.parse(response.body)
    assert(body.message, "Esperava mensagem de confirmação de update")
    this.clientIdTest = ""

    const idFake = "656419811898115156"
    const responseFakeClient = await this.clientService.deleteClientService(
      idFake
    )
    assert.equal(responseFakeClient.statusCode, 404, "Esperava statusCode 404")

    console.log("Teste de deleção de cliente passou")
  }

  async deleteItem() {
    if (this.clientIdTest)
      await this.clientService.deleteClientService(this.clientIdTest)
  }

  async run() {
    console.log("Iniciando testes...")
    try {
      await this.listClientsTest()
      await this.createClientTest()
      await this.getClientTest()
      await this.updateClientTest()
      await this.deleteClientTest()
      console.log("Testes finalizados com sucesso!!")
    } catch (error) {
      await this.deleteItem()
      throw error
    }
  }
}

const testInstance = new UnitTests()
testInstance
  .run()
  .catch((err) => console.error("Um teste falhou:", err.message))

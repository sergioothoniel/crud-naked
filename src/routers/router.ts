import { RouterClass } from "."
import { ClientController } from "../controllers/client.controller"
import { Request } from "../types"

export class Router {
  request: Request
  clientController: ClientController

  constructor(request: Request) {
    this.request = request
    this.clientController = new ClientController()
  }

  run() {
    const router = new RouterClass(this.request)

    router.POST("/clients/insert", this.clientController.createClientController)
    router.GET("/clients/list", this.clientController.listClientsControlle)
    router.GET("/clients/get/:id", this.clientController.getClientController)
    router.PATCH(
      "/clients/update/:id",
      this.clientController.updateClientController
    )
    router.DELETE(
      "/clients/delete/:id",
      this.clientController.deleteClientController
    )

    return router.use()
  }
}

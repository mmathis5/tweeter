import { DAOFactory } from "../dao/DAOFactory";

export abstract class Service {
  protected daoFactory?: DAOFactory;

  constructor(daoFactory: DAOFactory) {
    this.daoFactory = daoFactory;
  }

  protected async doWithDAOFactory<T>(operation: (daoFactory: DAOFactory) => Promise<T>): Promise<T> {
    if (!this.daoFactory) {
      throw new Error("DAOFactory not initialized");
    }
    return await operation(this.daoFactory);
  }

}
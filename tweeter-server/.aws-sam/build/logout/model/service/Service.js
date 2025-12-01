"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
class Service {
    daoFactory;
    constructor(daoFactory) {
        this.daoFactory = daoFactory;
    }
    async doWithDAOFactory(operation) {
        if (!this.daoFactory) {
            throw new Error("DAOFactory not initialized");
        }
        return await operation(this.daoFactory);
    }
}
exports.Service = Service;

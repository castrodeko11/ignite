const express = require('express');
const { v4: uuidv4 } = require("uuid"); 

const app = express();
app.use(express.json());

/**
 * cpf - String
 * name - String
 * id - uuid
 * statement []
 */

const customers = [];

app.post("/account", (request, response)=> {
    const {cpf, name} = request.body;

    const customerAlreadyExists = customers.some(
        (customers) => customers.cpf === cpf
        ); 

    if(customerAlreadyExists){
        return response.status(400).json({error: "Customer already exists!"});
    }

    customers.push({
        cpf,
        name,
        id:uuidv4(),
        statement: [],
    });

    return response.status(201).send();
})

app.get("/statement/:cpf", (request, response) => {
    const {cpf} = request.params;

    const customer = customers.find(customers => customers.cpf === cpf);

    return response.json(customer.statement);

})

app.listen(3333);

/**
 * GET - Buscar uma informação dentro do servidor
 * POST - Inserir uma informação no servidor
 * PUT - Alterar uma informação no servidor
 * PATCH - Alterar uma informação específica
 * DELETE - Deletar uma informação no servidor
 */

/**
 * Tipos de parâmetros 
 * 
 * Routes Params => Identificar um recurso editar/deletar
 * Query Params => Paginação / Filtro
 * Body Params => Os objetos inserção/alteração (JSON)
 */



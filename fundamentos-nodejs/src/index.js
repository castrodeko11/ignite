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


// Middleware
function verifyIfExistesAccountCPF(request,response,next){

    const {cpf} = request.headers;

    const customer = customers.find(customers => customers.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Customer not found"});
    }

    request.customer = customer;

    return next();
}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) =>{
        if(operation.type === 'credit'){

            return acc + operation.amount;
        }else {
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}

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
});

/*
 * Included in all routers 
 * app.use(verifyIfExistesAccountCPF);
 */


app.get("/statement", verifyIfExistesAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);

});

app.post("/deposit", verifyIfExistesAccountCPF,  (request,response) => {
    const {description, amount } = request.body;

    const {customer} = request;

    const statementOperation = {
        description,
        amount,
        create_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();

});

app.post("/withdraw", verifyIfExistesAccountCPF, (request, response) =>{
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({error : "Insufficient founds!"})
    }

    const statementOperation = {
        amount,
        create_at: new Date(),
        type: "debit",
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();

});

app.get("/statement/date", verifyIfExistesAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    console.log(dateFormat);

    const statement = customer.statement.filter((statement) => statement.create_at.toDateString() === new Date 
    (dateFormat).toDateString());

    return response.json(statement);

});


app.put("/account", verifyIfExistesAccountCPF,  (request, response) => {
    const { name } = request.body;
    const {customer } = request;

    customer.name = name;

    return response.status(201).send();

});


app.get ("/account", verifyIfExistesAccountCPF,  (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.delete("/account", verifyIfExistesAccountCPF, (request, response) => {
    const { customer } = request;

    //splice
    customers.splice(customer, 1);

    return response.status(200).json(customers);
});


app.get("/balance", verifyIfExistesAccountCPF, (request, response ) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);

});

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



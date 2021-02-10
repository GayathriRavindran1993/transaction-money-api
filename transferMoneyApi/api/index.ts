import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes/routes";
import {User} from "./entities/user";
import { Account, AccountType } from "./entities/account";

// create express app
const app = express();
app.use(bodyParser.json());

// start express server
const server = app.listen(3000);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

// register express routes from defined application routes
Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = (new (route.controller as any))[route.action](req, res, next);
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

        } else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});



createConnection().then(async connection => {
    const userCounts = await connection.manager.count(User);
    // Initializing users and accounts for test
    if (userCounts === 0) {
        // insert new users for test
        const user1 = await connection.manager.save(connection.manager.create(User, {
            firstName: "Gayathri",
            lastName: "Saw",
            age: 27
        }));
        const user2 = await connection.manager.save(connection.manager.create(User, {
            firstName: "Phantom",
            lastName: "Assassin",
            age: 24
        }));
        const user3 = await connection.manager.save(connection.manager.create(User, {
            firstName: "Ninja",
            lastName: "Warrior",
            age: 24
        }));
        const allUsers = [user1, user2, user3];
        const allAccountTypes = [AccountType.BASIC_SAVINGS, AccountType.CURRENT, AccountType.SAVINGS];

        for (const user of allUsers) {
            for (let index = 0; index < 4; index++) {
                const randomAccountTypeIndex = Math.floor(Math.random() * 3);
                const randomAccountType = allAccountTypes[randomAccountTypeIndex];
                const balanceThreshold = randomAccountType === AccountType.BASIC_SAVINGS ? 50000 : 100000;
                const randomBalance = Math.floor(Math.random() * balanceThreshold);
                await connection.manager.save(connection.manager.create(Account, {
                    user: user,
                    balanceAmount: randomBalance,
                    accountType: randomAccountType
                }));
            }
        }
    }
    console.log("Express server has started on port 3000. Open http://localhost:3000/api-docs/#/ to see swagger documentation");
}).catch(error => {
    console.log(error)
    server.close();
});
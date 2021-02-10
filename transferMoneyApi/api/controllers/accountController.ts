 
import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Account, AccountType} from "../entities/account";
import { User } from "../entities/user";


export class AccountController {
    private accountRepository = getRepository(Account);
    private userRepository = getRepository(User);
    private balanceAmount = 50000;
    public static BASIC_SAVINGS_MAX_BALANCE_AMOUNT= 50000;
    public static BASIC_SAVINGS_BALANCE_AMOUNT_EXCEEDED= "basic balance limit exceeded";
    public async all(request: Request, response: Response, next: NextFunction) {
        return this.accountRepository.find();
    }
    public async one(request: Request, response: Response, next: NextFunction) {
        return this.accountRepository.findOne(request.params.id);
    }

    public async save(request: Request, response: Response, next: NextFunction) {
        const accountDetails = request.body;
        if (accountDetails.accountType == AccountType.BASIC_SAVINGS && accountDetails.balanceAmount > this.balanceAmount) {
            return response.status(500).json({message: "Balance amount limit reached"});
            
        }
        let user:User;
        try {
        user = await this.userRepository.findOne(accountDetails.userId);
        }catch (error) {
            return response.status(404).json({ message: "user does not exist" });
        }
        const newAccount = this.accountRepository.create( {
            accountType: accountDetails.accountType,
            balanceAmount: accountDetails.balanceAmount,
            user: user
        })
        try {
            await this.accountRepository.save(newAccount);    
        } catch (error) {
            return response.status(500).json({ message: "account creation failed" });
        }
    
        return response.status(200).json({ message: "user account created" });
    }

    public async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.accountRepository.findOne(request.params.id);
        await this.accountRepository.remove(userToRemove);
    }
        

    }


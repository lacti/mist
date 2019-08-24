import { IBudget, IUser } from "..";
import { CollectionInUser } from "./collectionInUser";

export class BudgetEO extends CollectionInUser<IBudget> {
  constructor(user: IUser) {
    super(user, "budgets");
  }

  public findNameByIndex(index: number) {
    const maybe = this.findByIndex(index);
    return maybe ? maybe.name : undefined;
  }

  public get current() {
    return this.findByIndex(this.user.currentBudgetIndex);
  }
}
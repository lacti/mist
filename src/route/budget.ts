import { UserStateName } from "../repository";
import says from "../says";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(/^(?:예산\s*도움말)[!?]?/, () => says.noBudget())
    .add(/^(?:예산)$/, eo =>
      !eo.budget.current
        ? says.noBudget()
        : says.currentBudget({
            name: eo.budget.current.name,
            amount: eo.budget.current.amount,
            remain: eo.remain,
            currency: eo.budget.current.currency
          })
    )
    .add(/^(?:예산\s*목록)$/, eo =>
      eo.budget.elements.length === 0
        ? says.budgetHelp()
        : eo.budget.elements.map(says.budgetListItem).join("\n")
    )
    .add(
      /^(?:예산)\s*(?:설정|책정)\s*(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
      (eo, amount, currency, maybeName) => {
        const name = (maybeName || "").trim();
        if (!name) {
          return says.budgetHelp();
        }
        eo.budget.add({ name: name.trim(), amount: +amount, currency });
        return says.yes();
      }
    )
    .add(/^(?:예산)\s*(?:삭제)\s*(.+)$/, (eo, maybeName) => {
      const name = (maybeName || "").trim();
      const target = eo.budget.find(each => each.name === name);
      if (!target) {
        return says.noBudget();
      }
      eo.state.set({
        name: UserStateName.deleteBudget,
        selectedIndex: target.index
      });
      return says.confirmDeleteBudget(target);
    })
    .add(/^(?:예산)\s*(?:취소)$/, eo => {
      eo.value.currentBudgetIndex = -1;
      return says.resetBudget();
    })
    .add(/^(?:예산)\s*(?:설정)?\s*(.+)$/, (eo, maybeName) => {
      const name = (maybeName || "").trim();
      const target = eo.budget.find(each => each.name === name);
      if (!target) {
        return says.noBudget();
      }
      eo.value.currentBudgetIndex = target.index;
      return says.changeBudget(target);
    }),
  [UserStateName.deleteBudget]: new Router()
    .add(/^(?:ㅇㅇ|지워|삭제)[!]*$/, eo => {
      const state = eo.state.get();
      if (state.name === UserStateName.deleteBudget) {
        eo.budget.remove(state.selectedIndex);
        eo.history.removeWhere(
          each => each.budgetIndex === state.selectedIndex
        );
      }
      eo.state.reset();
      return says.deleted();
    })
    .add(/^(?:ㅂㅂ|ㄴㄴ|아니|취소)[!]*$/, eo => {
      eo.state.reset();
      return says.modificationCompleted();
    })
};

export default routes;
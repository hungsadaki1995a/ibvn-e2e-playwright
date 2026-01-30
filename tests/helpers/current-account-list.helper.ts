export function getAccountCountByType(accounts: any[], type: string): number {
  return accounts.filter((account: any) => account.dep_sjt_class === type)
    .length;
}

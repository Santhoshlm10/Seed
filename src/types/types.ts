export interface IMenuItem {
  name: string;
  icon: React.ReactNode;
  onClick: (data: any) => void
}
export interface IMenuList {
  lists: IMenuItem[];
}
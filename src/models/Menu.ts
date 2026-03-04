export interface IMenuItem {
  name: string;
  icon: React.ReactNode;
  onClick: (data: string) => void
}
export interface IMenuList {
  lists: IMenuItem[];
  trigger?: React.ReactNode;
  position?: 'top' | 'bottom';
}
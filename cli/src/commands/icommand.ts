export interface ICommand
{
	(cwd: string, ...args: string[]): any;
}

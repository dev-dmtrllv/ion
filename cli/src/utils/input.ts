import { createInterface } from "readline";

export const getInput = async (property: string, options: InputOptions = {}) =>
{
	const questionString = `${property}: ${options.defaultValue ? `(${options.defaultValue}) ` : ""}`;
	const ask = () => new Promise<string>((res) => 
	{
		const rl = createInterface(process.stdin, process.stdout);
		rl.question(questionString, (response) => 
		{
			rl.close();
			response = !!response.trim() ? response : (options.defaultValue || "");
			res(response);
		});
	});

	let response = await ask();
	
	while (!response.trim() && !options.allowEmpty)
	{
		console.log(`"${response}" is not valid!`);
		response = await ask();
	}
	
	return response;
}

type InputOptions = {
	defaultValue?: string;
	allowEmpty?: boolean;
}

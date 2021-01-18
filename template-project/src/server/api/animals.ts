import { Api } from "ion/server"

/**
 * 	If we dont set a url here the api tree will generate its own url based on the parent/child namings of the tree object
 * 	for example 
 * 	
 * 	{ 
 * 		foo: 
 * 		{ 
 * 			bar: BarApi
 * 		}
 * 	}
 * 
 * 	will become /api/foo/bar
 */
@Api.URL("/animals-list")
export class Animals extends Api
{
	private static animalList: string[] = [
		"elephant",
		"monkey",
		"leopard",
		"badger",
		"cow",
		"chicken"
	];

	public get = () => Animals.animalList;

	public post = (props: { name: string }): PostResponse => 
	{
		if(Animals.animalList.includes(props.name))
			return { success: false, error: `${props.name} already exists!` };
	
		Animals.animalList.push(props.name);
		return { success: true, animalList: Animals.animalList };
	}
}

type PostResponse = {
	success: false;
	error: string;
} | {
	success: true;
	animalList: string[];
}

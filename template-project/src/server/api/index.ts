import { Api } from "ion/server";
import { Animals } from "./animals";

export default Api.createTree({
	animals: Animals
});

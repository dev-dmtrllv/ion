import { fetchApi } from "ion/async";
import React from "react";

const App: React.FC = () => 
{
	return fetchApi(api.animals, "get", undefined, ({ data, isResolving, error }, updateData) => 
	{
		const [val, setVal] = React.useState<string>("");
		const [err, setErr] = React.useState<string | null>(error ? error.message : null);

		if (data)
		{
			const addAnimal = async () =>
			{
				const response = await api.animals.post({ name: val });
				if (response.success)
				{
					setVal("");
					setErr(null);
					updateData(response.animalList);
				}
				else
				{
					setVal("");
					setErr(response.error);
				}
			}

			// update state on input change
			const onChange = e => setVal(e.target.value);

			// add the animal when we press enter
			const onKeyDown = e => e.key.toLowerCase() === "enter" && addAnimal();

			return (
				<>
					<h1>hi</h1>
					{err && <p>{err}</p>}
					<input type="text" placeholder="animal name" value={val} onChange={onChange} onKeyDown={onKeyDown}/>
					<button onClick={addAnimal}>Add Animal</button>
					<br />
					{[...data].reverse().map((animal, i) => <p key={i}>{animal}</p>)}
				</>
			);
		}
		else if (isResolving)
		{
			return <h1>Loading.....</h1>;
		}
		return null;
	});
};

export default App;

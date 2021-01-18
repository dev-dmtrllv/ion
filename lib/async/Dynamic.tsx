import React from "react";
import { Async, AsyncFC } from "./Async"
import { AsyncDataMap } from "./AsyncContext";

export const getImportPaths = (data: AsyncDataMap, remove: boolean = false) =>
{
	const importPaths: string[] = [];
	const idLength = "Dynamic:".length;
	Object.keys(data).forEach((k) => 
	{
		if (k.startsWith("Dynamic"))
		{
			importPaths.push(k.substr(idLength, k.length));
			if(remove)
				delete data[k];
		}
	});
	return importPaths;
}

export const Dynamic: AsyncFC<DynamicProps> = ({ path, importer, children, ...rest }) =>
{
	return (
		<Async resolver={importer} componentID={"Dynamic"} id={path} {...rest}>
			{({ data, error, isResolving }) => children({ Component: data && data.default ? data.default : undefined, error, isResolving })}
		</Async>
	);
}

type DynamicProps = {
	path: string;
	importer: () => Promise<any>;
	children: (state: { Component?: React.FC | React.ComponentClass, error?: Error, isResolving: boolean }) => JSX.Element | null;
};

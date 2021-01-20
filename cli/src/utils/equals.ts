export const equals = (a: object | [] | undefined, b: object | [] | undefined) =>
{
	if(typeof a === "undefined" || typeof b === "undefined")
	{
		return a === b;
	}
	
	for (const p in a)
	{
		const v = a[p];
		const w = b[p]
		if (typeof v !== typeof w)
		{
			return false;
		}
		else if (typeof v === "object" && !equals(v, w))
		{
			return false;
		}
		else if (Array.isArray(v) && !equals(v, w))
		{
			return false;
		}
		else if (v !== w)
		{
			return false;
		}
	}
	return true;
}

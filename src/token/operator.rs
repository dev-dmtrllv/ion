pub const OPERATORS: [char; 13] = ['=', '+', '-', '*', '/', '&','|', '!', '~','<', '>', '?', '@'];

pub fn is_operator(char: char) -> bool {
	OPERATORS.contains(&char)
}

pub fn is_str_operator<'a, T: Into<&'a str>>(val: T) -> bool {
	let str: &str = &val.into();
	if let Some(c) = str.chars().nth(0) {
		OPERATORS.contains(&c)
	} else {
		false
	}
}

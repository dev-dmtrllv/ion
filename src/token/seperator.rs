pub const SEPERATORS: [char; 15] = [' ', '\t', '\r', '\n', ';', '"', '\'', '{', '}', '(', ')', '[', ']', ',', ':'];

pub const IGNORABLE_SEPERATOR: [char; 4] = [' ', '\t', '\r', '\n'];

pub fn is_seperator(val: char) -> bool {
	SEPERATORS.contains(&val)
}

pub fn is_ignorable_seperator(val: char) -> bool {
	IGNORABLE_SEPERATOR.contains(&val)
}

pub fn is_identifier<'a, T: Into<&'a str>>(string: T) -> bool {
	let s: &'a str = string.into();
	let mut chars = s.chars();
	if let Some(char) = chars.next() {
		if char.is_alphabetic() {
			while let Some(char) = chars.next() {
				if !char.is_alphanumeric() && char != '_' {
					return false;
				} 
			}
			true
		} else {
			false
		}
	} else {
		false
	}
}

#[derive(Debug, Clone)]
pub struct Location {
    pub line: usize,
    pub col: usize,
}

impl Location {
    pub fn new() -> Self {
        Self { line: 1, col: 1 }
    }

    pub fn next(&mut self) {
        self.col += 1;
    }

    pub fn add(&mut self, len: usize) {
        self.col += len;
    }

    pub fn next_line(&mut self) {
        self.col = 1;
        self.line += 1;
    }

    pub fn advance_from_char(&mut self, char: char) {
        match char {
            '\n' => self.next_line(),
            '\r' => {}
            '\t' => self.add(4),
            _ => self.next(),
        }
    }

	pub fn clone_from_buffer(&mut self, str: &str) -> Self {
		let cloned = self.clone();
		self.col += str.len();
		cloned
	}
}

impl Display for Location {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(f, "Ln {}, Col {}", self.line, self.col)
	}
}

pub const KEYWORDS: [&str; 22] = [
    "struct", "fn", "let", "const", "type", "export", "import", "this", "concept", "use", "if",
    "else", "for", "while", "return", "loop", "in", "enum", "asm", "mut", "true", "false"
];

pub fn is_keywords<'a, T: Into<&'a str>>(val: T) -> bool {
    KEYWORDS.contains(&val.into())
}

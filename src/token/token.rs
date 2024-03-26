use std::fmt::Display;

#[derive(Debug, PartialEq, Clone)]
pub enum Token<'a> {
    Separator(&'a str),
    Unknown(&'a str),
    Keyword(&'a str),
    Identifier(&'a str),
    Operator(&'a str),
    StringLiteral(&'a str),
    CharLiteral(&'a str),
    NumberLiteral(&'a str),
}

impl<'a> Display for Token<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", &self)
    }
}

#[allow(unused)]
impl<'a> Token<'a> {
    pub fn match_value<T: Into<&'a str>>(&self, value: T) -> bool {
        let str_val: &'a str = value.into();
        self.value() == str_val
    }

    pub fn match_char(&self, value: char) -> bool {
        self.match_value(value.to_string().as_str())
    }

    pub fn value(&self) -> &'a str {
        match self {
            Token::Separator(str) => *str,
            Token::Unknown(str) => *str,
            Token::Keyword(str) => *str,
            Token::Identifier(str) => *str,
            Token::Operator(str) => *str,
            Token::StringLiteral(str) => *str,
            Token::CharLiteral(str) => *str,
            Token::NumberLiteral(str) => *str,
        }
    }

	pub fn name(&self) -> &'static str {
        match self {
            Token::Separator(_) => "Seperator",
            Token::Unknown(_) => "Unknown",
            Token::Keyword(_) => "Keyword",
            Token::Identifier(_) => "Identifier",
            Token::Operator(_) => "Operator",
            Token::StringLiteral(_) => "StringLiteral",
            Token::CharLiteral(_) => "CharLiteral",
            Token::NumberLiteral(_) => "NumberLiteral",
        }
    }

    pub fn is_identifier(&self) -> bool {
        match self {
            Token::Identifier(_) => true,
            _ => false,
        }
    }

    pub fn is_separator(&self) -> bool {
        match self {
            Token::Separator(_) => true,
            _ => false,
        }
    }

    pub fn is_operator(&self) -> bool {
        match self {
            Token::Operator(_) => true,
            _ => false,
        }
    }

    pub fn is_keyword(&self) -> bool {
        match self {
            Token::Operator(_) => true,
            _ => false,
        }
    }
}

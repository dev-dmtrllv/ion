use std::fmt::Display;

#[derive(Debug, PartialEq)]
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
            Separator(str) => *str,
            Unknown(str) => *str,
            Keyword(str) => *str,
            Identifier(str) => *str,
            Operator(str) => *str,
            StringLiteral(str) => *str,
            CharLiteral(str) => *str,
            NumberLiteral(str) => *str,
        }
    }

	pub fn name(&self) -> &'static str {
        match self {
            Separator(_) => "Seperator",
            Unknown(_) => "Unknown",
            Keyword(_) => "Keyword",
            Identifier(_) => "Identifier",
            Operator(_) => "Operator",
            StringLiteral(_) => "StringLiteral",
            CharLiteral(_) => "CharLiteral",
            NumberLiteral(_) => "NumberLiteral",
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

pub use Token::*;
